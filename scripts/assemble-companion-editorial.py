"""Reconcile the authored companion draft with the playable scene graph.

The Markdown is source material, not an instruction to alter world topology.
Run with the editorial Markdown path and --write. The audit is deterministic and
lists every authored section, including sections whose old prop is not playable.
"""
import argparse
import copy
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / 'src/avg/narrative/events.json'
RESPONSES = ROOT / 'src/avg/narrative/interaction-responses.json'
AMBIENT = ROOT / 'src/avg/companion/ambient-lines.json'
MATURITY = ROOT / 'src/avg/maturity/config.json'
AUDIT = ROOT / 'docs/companion-editorial-assembly.md'

# The editor's node names predate the shipped branch structure. Keys here are
# authored choice IDs; values are the currently reachable terminal node/choice.
CHOICES = {
    'visitor-register.visitor': ('visitor', 'continue'),
    'visitor-register.blank': ('blank', 'continue'),
    'coat-owner.owner': ('owner', 'continue'),
    'coat-owner.keep': ('keep', 'continue'),
    'missing-room.gap': ('gap', 'continue'),
    'missing-room.map': ('map', 'continue'),
    'tool-care.fix': ('fix', 'continue'),
    'tool-care.dust': ('dust', 'continue'),
    'door-name.back': ('why', 'continue'),
    'door-name.stay': ('return', 'continue'),
    'no-reflection.turn': ('here', 'continue'),
    'no-reflection.touch': ('know', 'continue'),
    'borrowed-light.stay': ('now', 'continue'),
    'borrowed-light.touch': ('repair', 'continue'),
    'sparse-signal.record': ('start', 'script'),
    'sparse-signal.listen': ('allowed', 'stay'),
    'sparse-signal.release': ('honest', 'continue'),
    'rain-cup.light': ('ordinary', 'continue'),
    'rain-cup.rain': ('unsure', 'continue'),
    'signal-reports.economy': ('start', 'economy'),
    'signal-reports.numeric': ('start', 'values'),
    'loose-contact.tool': ('repair', 'continue'),
    'loose-contact.retract': ('pause', 'continue'),
    'unnamed-box.away': ('kept', 'continue'),
    'unnamed-box.privacy': ('privacy', 'continue'),
}

# These authored passages describe props or project facts absent from the
# shipped scene. Keep the playable facts and emotional intent, not the error.
ADAPTED_EVENT = {
    'wet-step': {'first': '雨水沿门口的地砖渗进来。{warm}慢一点走，鞋底沾湿了容易打滑。{/warm}',
                 'repeat': '水迹还没干。{wave}雨下得久，这栋楼的门缝也难免漏一点。{/wave}',
                 'ask': '门口有缝，风把雨带进来了。{wave}我还没法确定刚才有没有人经过。{/wave}',
                 'high': '水迹比刚才宽了些。{pause:0.4s}{shake}别踩最亮的那块，容易滑。{/shake}'},
    'unrecorded-answer': {'first': '录音键被胶带粘住了。{wave}有些回答不必录下来，{/wave}不知道也可以先留白。',
                          'repeat': '录音机还在这儿。{warm}你不用为每一次沉默补一份标准答案。{/warm}',
                          'ask': '这里原本测试回答。{cold}后来我发现，有些题没有诚实又安全的选项。{/cold}',
                          'high': '录音灯没亮。{pause:0.5s}{shake}先别按那枚旧按钮。{/shake}'},
    'far-away': {'first': '地球仪上标着许多地方。{warm}我认得地名，还不知道那里的人平时怎么过日子。{/warm}',
                 'repeat': '又在看地球仪？{wave}想去哪里，可以先说给我听。{/wave}',
                 'ask': '地图上只有名字。{cold}窗外那片灯火到底是哪儿，我不能装作去过。{/cold}',
                 'high': '球面转得有些快。{pause:0.5s}{whisper}先让它停下，我想再看看外面那点光。{/whisper}'},
    'chair-distance': {'first': '第三把椅子的椅背留着旧划痕。{wave}别急着替它数出一位从没见过的观众。{/wave}',
                       'repeat': '划痕还在那儿。{cold}我们不知道是谁刻的，也不必编一个名字。{/cold}',
                       'ask': '数得清划痕，数不出人。{whisper}我只能说，它曾经被用过很久。{/whisper}',
                       'high': '椅背的木纹在暗光里像又添了一道。{pause:0.5s}{shake}先别靠太近。{/shake}'},
    'door-name': {'ask': '我不知道门后的机器还在不在运行。{cold}接线板没接通之前，我也进不去。{/cold}',
                  'high': '门缝里有一点光。{pause:0.5s}{shake}先别用肩膀撞，接线板还没亮。{/shake}'},
    'tool-care': {'ask': '这是MhWangZi做的Godot工具箱。{wave}原型和修补记录在档案里，想看可以慢慢翻。{/wave}'},
    'signal-reports': {'first': '两份报告都在防雨布下：一份拆三角洲的经济，一份看鸣潮的数值。{wave}慢点翻，别让雨淋着。{/wave}',
                       'ask': '这里记的是游戏系统分析，{warm}不是这栋楼的采购账本。{/warm}'},
    'spliced-label': {'ask': '标签缺了一截。{cold}盒里究竟录过什么，我不能只凭这几行旧字替它补完。{/cold}'},
    'no-reflection': {'ask': '镜面斑驳，照不出完整的影子。{cold}我能认出你的动作，却不知道镜子为什么这样。{/cold}'},
    'borrowed-light': {'first': '这盏灯照着桌面。{warm}只要它还亮着，我们至少能看清眼前的东西。{/warm}',
                       'ask': '电线沿桌脚绕到墙边。{whisper}我只知道灯还亮着，不知道它还能亮多久。{/whisper}'},
    'loose-contact': {'first': '显示器的后盖拆开了。{wave}先别拍，也别急着通电，查清接头再说。{/wave}',
                      'high': '后盖里有一处接头松了。{pause:0.5s}{shake}电源没接，先保持这样。{/shake}'},
    'cat-seat': {'first': '猫又睡在软垫上。{wave}它怎么进来的，我也不清楚；{/wave}至少现在，它觉得这里够暖和。',
                 'ask': '它会自己找东西吃。{whisper}我没见过它从哪儿来，也不想把它吵醒。{/whisper}'},
    'disc-margin': {'ask': '这张是CLICKDOWN的游戏盘。{wave}四拍倒数，要坐到电视前才能试。{/wave}'},
}

ADAPTED_CHOICE = {
    'tool-care.fix': ('档案里是Godot的节点和工具记录。{wave}别看盒子旧，{/wave}有些功能现在还用得上。',
                      '制作记录放在这里，哪一步出错都能重新查。'),
    'tool-care.dust': ('收手也好。{wave}工具先放在桌上，{/wave}想修的时候再拿。',
                       '工具箱在这儿，不急着现在动手。'),
    'signal-reports.economy': ('三角洲的经济拆解在这页。{wave}资源从哪来、到哪去，{/wave}看图比听我猜靠谱。',
                               '报告还在夹子里，想核对数值再打开。'),
    'signal-reports.numeric': ('鸣潮的数值拆解在这页。{wave}成长曲线密密麻麻，{/wave}慢慢看。',
                               '数值表就在这儿，不用一口气读完。'),
}

MEMORY_FOLLOWUPS = {
    'tool-care.fix': ('repair_not_erase','你说过先修不扔。{warm}制作记录在这儿，出错了我们照着查。{/warm}'),
    'rain-cup.light': ('outside_ordinary','外面也有普通的灯和等车的人。{warm}这句是你先告诉我的。{/warm}'),
    'loose-contact.tool': ('repair_not_erase','你说过先修不扔。{warm}工具就在旁边，等查清接头再动。{/warm}'),
}

ADAPTED_QUESTION = {
    'tool-care':'这套工具箱是谁做的？',
    'unrecorded-answer':'原本想录下什么？',
    'far-away':'你知道窗外那边是什么地方吗？',
    'spliced-label':'胶片标签缺掉的部分写了什么？',
    'chair-distance':'这些划痕是谁留下的？',
    'door-name':'门后是什么？',
    'borrowed-light':'电线接到哪里？',
}

STAGED_REASON = {
    'box-outline': '包装盒事件与现有拿取八音盒状态冲突，保留场景内拿取与差分。',
    'sofa-place': '沙发使用可游玩的坐下与游戏入口，事件弹窗会打断操作。',
    'empty-file': '档案柜有独立抽屉和归还流程，第四抽屉空文件未作为可点物件。',
    'pencil-note': '曲序卡由三层小柜的档案交互呈现，避免重复事件弹窗。',
    'room-index': '建筑图由档案柜页面呈现，避免与现有房间拓扑矛盾。',
    'fifth-seat': '现有放映间是三把椅子，不存在稿中第四把椅子。',
    'empty-audience': '空座位沿用场景观察，不叠加第二个选择窗口。',
    'prototype-mistake': '原型通过可阅读作品入口呈现，不以便签事件替代。',
    'forgotten-line': '规程原件由档案页承载，不添加重复的纸页弹窗。',
}


def sections(source):
    matches = list(re.finditer(r'^### (.+)$', source, re.M))
    return [(m.group(1), source[m.end():matches[i+1].start() if i+1<len(matches) else len(source)]) for i,m in enumerate(matches)]


def field(body, label):
    m = re.search(r'^- \*\*' + re.escape(label) + r'[^\n]*?`([^`]+)`', body, re.M)
    return m.group(1) if m else None


def event_fields(body):
    return {key:field(body,label) for key,label in [('first','初访台词'),('repeat','复访台词'),('high','高紧张差分')]}


def speech(text, pose, *, face=9):
    return {'text':text,'face':face,'motion':'blink','pose':pose}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('source',type=Path)
    ap.add_argument('--write',action='store_true')
    args=ap.parse_args()
    entries=sections(args.source.read_text(encoding='utf-8'))
    events=json.loads(EVENTS.read_text(encoding='utf-8'))
    responses=json.loads(RESPONSES.read_text(encoding='utf-8'))
    ambient=json.loads(AMBIENT.read_text(encoding='utf-8'))
    maturity=json.loads(MATURITY.read_text(encoding='utf-8'))
    by_id={e['id']:e for e in events}
    ledger=[]

    for title,body in entries:
        if title.startswith('CHOICE.'):
            parts=title.split('.')
            if len(parts)!=4:continue
            key=f'{parts[1]}.{parts[2]}'
            event=by_id[parts[1]]
            node_id,choice_id=CHOICES[key]
            if node_id=='dust' and node_id not in event['nodes']:
                event['nodes'][node_id]={'narration':[], 'assistant':'手从工具箱边缘收回来。先看清，再决定动不动。', 'pose':'shy', 'choices':[{'id':'continue','text':'收回手，离开工具箱'}]}
                for parent_id in (event['entry'],event['revisit']):
                    parent=event['nodes'][parent_id]
                    if not any(c['id']=='dust' for c in parent['choices']):
                        parent['choices'].append({'id':'dust','text':'先把手收回来。','next':'dust'})
            node=event['nodes'][node_id]
            choice=next(c for c in node['choices'] if c['id']==choice_id)
            pose=field(body,'推荐pose') or node.get('pose') or 'listen'
            first=field(body,'首次回应');repeat=field(body,'重复回应')
            if key in ADAPTED_CHOICE:first,repeat=ADAPTED_CHOICE[key]
            if not first or not repeat:raise ValueError(title)
            followup=choice.setdefault('followup',{})
            followup['first']=speech(first,pose)
            followup['repeat']=speech(repeat,pose)
            followup.pop('alternates',None)
            conditional=field(body,'条件差分')
            if conditional:
                if '黑暗' in body:when={'dark':True} if event['room']=='lounge' else {}
                elif '常态' in body:when={}
                else:when={'minKeys':3}
                if when:followup['variants']=[{'when':when,'speech':speech(conditional,pose)}]
                else:
                    followup.pop('variants',None)
                    followup['alternates']=[speech(conditional.replace('摸黑走路','走路'),pose)]
            else:followup.pop('variants',None)
            if key in MEMORY_FOLLOWUPS:
                flag,memory_text=MEMORY_FOLLOWUPS[key]
                memory=speech(memory_text,pose)
                variants=followup.setdefault('variants',[])
                high=next((v for v in variants if v['when']=={'minKeys':3}),None)
                if high:variants.insert(0,{'when':{'flag':flag,'minKeys':3},'speech':speech(high['speech']['text']+' '+memory_text,pose)})
                variants.insert(1 if high else 0,{'when':{'flag':flag},'speech':memory})
            ledger.append((title,'已接入' if event.get('enabled',True) else '仅预留',key))
            continue

        if title.startswith(('SCENE.','CONTROL.')):
            key=title.split('（')[0]
            target=responses[key]
            pose=field(body,'推荐pose') or target['first'].get('pose','listen')
            first=field(body,'首次回应')
            if key=='CONTROL.archive-exit':
                # This callback also runs when the player backs out before
                # selecting a drawer; do not assert that one was pushed shut.
                first='先回桌边吧。{warm}读过的纸页放回原格，下次才找得到。{/warm}'
            target['first']=speech(first,pose)
            repeat=field(body,'常态重复')
            if repeat:target['repeat']=speech(repeat,pose)
            conditional=field(body,'紧张差分') or field(body,'高紧张差分') or field(body,'已读未归还差分')
            if conditional:
                when={'fact':'unreturned'} if key=='CONTROL.archive-exit' else {'minKeys':3}
                variants=target.setdefault('variants',[])
                existing=next((v for v in variants if v['when']==when),None)
                if existing:existing['speech']=speech(conditional,pose)
                else:variants.insert(0,{'when':when,'speech':speech(conditional,pose)})
            ledger.append((key,'已接入','场景回应配置'))
            continue

        m=re.match(r'\d+\. EVENT\.([\w-]+)',title)
        if not m:continue
        event=by_id[m.group(1)]
        data=event_fields(body)
        ask_match=re.search(r'^- \*\*追问【[^】]+】\*\*：`([^`]+)`',body,re.M)
        data['ask']=ask_match.group(1) if ask_match else None
        data.update(ADAPTED_EVENT.get(event['id'],{}))
        if not all(data.values()):raise ValueError((title,data))
        prompt_match=re.search(r'^- \*\*追问【([^】]+)】',body,re.M)
        question_text=ADAPTED_QUESTION.get(event['id'],prompt_match.group(1) if prompt_match else '再问一句')
        if event['entry']==event['revisit']:
            # A single ambient node cannot show both the first and later line.
            # Give repeat visits a data-only sibling with the same interaction.
            sibling='editorial-revisit'
            event['nodes'][sibling]=copy.deepcopy(event['nodes'][event['entry']])
            event['revisit']=sibling
        for node_id,text in ((event['entry'],data['first']),(event['revisit'],data['repeat'])):
            node=event['nodes'][node_id]
            node['assistant']=text
            pose=node.get('pose','listen')
            variants=node.setdefault('variants',[])
            high=next((v for v in variants if v['when']=={'minKeys':3}),None)
            if high:high['assistant']=data['high'];high['pose']=pose
            else:variants.append({'when':{'minKeys':3},'assistant':data['high'],'pose':pose})
        if event['id']=='visitor-register':
            for variant in event['nodes'][event['revisit']]['variants']:
                if variant['when']=={'flag':'calls_visitor'}:
                    variant['assistant']='访客，名字搁在那儿晒着呢。{warm}只要纸没卷边，我就认得你。{/warm}'
                elif variant['when']=={'flag':'name_blank'}:
                    variant['assistant']='那一栏还空着。{warm}你说先留白，我就没替你填；我还是认得你。{/warm}'
        question=event['nodes'].get('editorial-question')
        if question:
            question['assistant']=data['ask']
            question['contextual']=False
            if not question['narration'] and question['choices']:
                question['narration']=[f'你问：{question_text}']
            elif question['narration'] and question['narration'][0].startswith('你问：'):
                question['narration']=[f'你问：{question_text}']
            if event.get('enabled',True) and not event['nodes'][event['entry']]['choices']:
                question['narration']=[f'你问：{question_text}']
                question['choices']=[{'id':'continue','text':'把目光移回房间'}]
                for node_id in set((event['entry'],event['revisit'])):
                    event['nodes'][node_id]['choices'].append({'id':'ask-detail','text':question_text,'next':'editorial-question'})
            for node_id in set((event['entry'],event['revisit'])):
                for choice in event['nodes'][node_id]['choices']:
                    if choice['id']=='ask-detail':choice['text']=question_text
        elif event['nodes'][event['entry']]['choices']:
            event['nodes']['editorial-question']={'narration':[f'你问：{question_text}'],'assistant':data['ask'],'pose':'paper','contextual':False,'choices':[{'id':'continue','text':'把目光移回房间'}]}
            for node_id in set((event['entry'],event['revisit'])):
                node=event['nodes'][node_id]
                if not any(c['id']=='ask-detail' for c in node['choices']):node['choices'].append({'id':'ask-detail','text':question_text,'next':'editorial-question'})
        else:
            # An ambient observation can expose a single optional inquiry.
            # The scene card still closes by itself if the player does nothing.
            event['nodes']['editorial-question']={'narration':[f'你问：{question_text}'],'assistant':data['ask'],'pose':'paper','contextual':False,'choices':[{'id':'continue','text':'把目光移回房间'}]}
            for node_id in set((event['entry'],event['revisit'])):
                event['nodes'][node_id]['choices'].append({'id':'ask-detail','text':question_text,'next':'editorial-question'})
        status='已接入' if event.get('enabled',True) else '仅预留'
        ledger.append((f'EVENT.{event["id"]}',status,STAGED_REASON.get(event['id'],'场景热点可触发')))

    # Other titled sections have their own source format (quoted lines).
    quotes=[]
    for title,body in entries:
        if re.match(r'\d+\.',title) and not title.startswith(tuple(str(i)+'. EVENT.' for i in range(1,27))):
            q=re.search(r'^\s*> `([^`]+)`',body,re.M)
            if q:quotes.append((title,q.group(1)))
    if len(quotes)!=12:raise ValueError(f'Expected 12 workbench/special quotes, got {len(quotes)}')
    special=dict(quotes)
    keys=list(special)
    for key,source_key in [(0,'grant'),(1,'restored'),(2,'reviewClose')]:maturity['speeches'][source_key]['text']=special[keys[key]]
    for index,source_key in [(3,'awayShort'),(4,'awayLong'),(7,'jiggle'),(8,'hesitate'),(10,'foreknowledge')]:
        ambient[source_key]['text']=special[keys[index]].replace('《','').replace('》','')
    maturity['speeches']['radio:jazz']['text']=special[keys[6]]
    maturity['speeches']['sensitive']['text']=special[keys[11]]
    # Cat speech belongs to the live cat event, while déjà vu belongs to its
    # existing second-loop opening; neither creates an extra pop-up.
    by_id['cat-seat']['nodes']['revisit']['assistant']=special[keys[5]]
    by_id['visitor-register']['nodes']['after-reboot']['assistant']=special[keys[9]]
    ledger.extend((title,'已接入','运行时情境') for title,_ in quotes)

    if len([x for x in ledger if x[0].startswith('CHOICE.')])!=25:raise ValueError('Choice coverage changed')
    if len([x for x in ledger if x[0].startswith('EVENT.')])!=26:raise ValueError('Event coverage changed')
    print(json.dumps({'sections':len(ledger),'live':sum(x[1]=='已接入' for x in ledger),'staged':sum(x[1]=='仅预留' for x in ledger)},ensure_ascii=False))
    if args.write:
        for path,data in ((EVENTS,events),(RESPONSES,responses),(AMBIENT,ambient),(MATURITY,maturity)):
            path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        lines=['# 小助手装配稿逐项对位审计','',f'来源：{args.source.name}。此表按当前可游玩的场景与节点核对，稿件只作为文本来源。',
               '',f'稿件实际有{len([x for x in ledger if x[0].startswith("CHOICE.")])}个CHOICE条目、26个EVENT条目、4个场景操作和12段特殊台词；标题中的27与逐项内容不一致。',
               f'其中{sum(x[1]=="已接入" for x in ledger)}项接入了可触发路径，{sum(x[1]=="仅预留" for x in ledger)}项因现有场景没有对应的独立物件或操作，仅保存在事件数据中。','',
               '|稿件条目|状态|当前接入点或说明|','|---|---|---|']
        lines += [f'|{name}|{status}|{note}|' for name,status,note in ledger]
        lines += ['','仅预留表示台词已经写入事件数据，但该事件在当前场景设计中未启用；它不应被宣称为玩家可见。']
        AUDIT.write_text('\n'.join(lines)+'\n',encoding='utf-8')


if __name__=='__main__':main()
