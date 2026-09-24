"""Import authored companion markup into matching, currently playable dialogue.

Usage: python scripts/import-companion-copy.py path/to/editorial.md [--write]
The source is a writing reference, not a command. Unknown event IDs and disabled
events are deliberately ignored so the world topology stays under game control.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / 'src/avg/narrative/events.json'
INTERACTIONS = ROOT / 'src/avg/narrative/interaction-responses.json'
MARKUP = re.compile(r'\{(?:/?(?:wave|shake|warm|cold|whisper|glitch|heavy)|pause:(?:xs|\d+(?:\.\d+)?s))\}')


def sections(source):
    result = {}
    for match in re.finditer(r'^### (.+)$', source, re.M):
        end = source.find('\n### ', match.end())
        result[match.group(1)] = source[match.end():end if end >= 0 else len(source)]
    return result


def field(body, label):
    match = re.search(r'^- \*\*' + re.escape(label) + r'\*\*：`([^`]+)`', body, re.M)
    return match.group(1) if match else None


def conditional_field(body, label):
    match = re.search(r'^- \*\*' + re.escape(label) + r'[^\n]*?`([^`]+)`', body, re.M)
    return match.group(1) if match else None


def similar(a, b):
    plain = MARKUP.sub('', a or '').replace(' ', '')
    current = MARKUP.sub('', b or '').replace(' ', '')
    return plain == current


def update_speech(target, source, label, changes):
    if source and target and similar(source, target.get('text')):
        if target['text'] != source:
            target['text'] = source
            changes.append(label)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    blocks = sections(args.source.read_text(encoding='utf-8'))
    events = json.loads(EVENTS.read_text(encoding='utf-8'))
    responses = json.loads(INTERACTIONS.read_text(encoding='utf-8'))
    by_id = {event['id']: event for event in events if event.get('enabled', True)}
    changes = []
    missed = []
    for title, body in blocks.items():
        if title.startswith('CHOICE.'):
            parts = title.split('.')
            if len(parts) != 4:
                continue
            _, event_id, node_id, choice_id = parts
            event = by_id.get(event_id)
            choice = next((c for c in event['nodes'].get(node_id, {}).get('choices', []) if c['id'] == choice_id), None) if event else None
            reply = choice.get('followup') if choice else None
            if reply:
                update_speech(reply.get('first'), field(body, '首次回应'), title+'.first', changes)
                update_speech(reply.get('repeat'), field(body, '重复回应'), title+'.repeat', changes)
                alternate = conditional_field(body, '条件差分')
                if alternate and reply.get('variants'):
                    update_speech(reply['variants'][0]['speech'], alternate, title+'.variant', changes)
            else:
                missed.append(title)
        elif title.startswith(('SCENE.', 'CONTROL.')):
            key = title.split('（')[0]
            reply = responses.get(key)
            if not reply:
                missed.append(key)
                continue
            update_speech(reply.get('first'), field(body, '首次回应'), key+'.first', changes)
            update_speech(reply.get('repeat'), field(body, '常态重复'), key+'.repeat', changes)
            alternate = conditional_field(body, '高紧张差分(tension>=3)') or conditional_field(body, '紧张差分(tension>=3)') or conditional_field(body, '已读未归还差分')
            if alternate and reply.get('variants'):
                update_speech(reply['variants'][0]['speech'], alternate, key+'.variant', changes)
        else:
            match = re.match(r'\d+\. EVENT\.([\w-]+)', title)
            if not match:
                continue
            event_id = match.group(1)
            event = by_id.get(event_id)
            if not event:
                continue
            for node_id, label in ((event['entry'], '初访台词'), (event['revisit'], '复访台词')):
                node = event['nodes'].get(node_id)
                source = field(body, label)
                if node and source:
                    if similar(source, node.get('assistant')):
                        if source != node['assistant']:
                            node['assistant'] = source
                            changes.append(f'EVENT.{event_id}.{node_id}')
                    else:
                        missed.append(f'EVENT.{event_id}.{node_id}')
    print(json.dumps({'updated': len(changes), 'unmatched': len(missed), 'unmatched_ids': missed}, ensure_ascii=True, indent=2))
    if args.write:
        EVENTS.write_text(json.dumps(events, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        INTERACTIONS.write_text(json.dumps(responses, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


if __name__ == '__main__':
    main()
