export type FragmentId =
  | 'fragment-01'
  | 'fragment-02'
  | 'fragment-03'
  | 'fragment-04'
  | 'fragment-05'

export type IndexZeroFragment = {
  id: FragmentId
  index: string
  recoveredText: string
  corruptedText: string
  corruptionFrames: string[]
  location: string
}

export const INDEX_ZERO_RECOVERY_PHRASE = '被删除的记录仍在继续编写'

export const indexZeroFragments: IndexZeroFragment[] = [
  {
    id: 'fragment-01',
    index: '01',
    recoveredText: '被删除',
    corruptedText: '被删▮',
    corruptionFrames: ['被删▯', '被刪▮', '被删_'],
    location: 'PUBLIC INDEX / CURRENT BUILDS',
  },
  {
    id: 'fragment-02',
    index: '02',
    recoveredText: '的记录',
    corruptedText: '的记彔',
    corruptionFrames: ['的记彑', '的記彔', '的记▮'],
    location: 'DESIGN RADAR / ACTIVE VECTOR',
  },
  {
    id: 'fragment-03',
    index: '03',
    recoveredText: '仍在',
    corruptedText: '仍_在',
    corruptionFrames: ['仞_在', '仍▮在', '仍_茬'],
    location: 'CASE FILES / CAROUSEL STATUS',
  },
  {
    id: 'fragment-04',
    index: '04',
    recoveredText: '继续',
    corruptedText: '继｜续',
    corruptionFrames: ['继丨续', '継｜续', '继▮续'],
    location: 'CURRENT BUILDS / REVISION LOG',
  },
  {
    id: 'fragment-05',
    index: '05',
    recoveredText: '编写',
    corruptedText: '编冩',
    corruptionFrames: ['編冩', '编▮', '缟冩'],
    location: 'FIELD NOTES / MARGIN',
  },
]

export const indexZeroFragmentIds = indexZeroFragments.map((fragment) => fragment.id)

export const recoveryErrors = [
  '记录顺序不正确。',
  '当前文本无法形成有效索引。',
  '缺少至少一个被删除的片段。',
  '该句从未存在于公开版本中。',
  'ERROR ██-05：系统不承认当前输入者。',
]

export const caseZeroStatus = [
  ['ARCHIVE STATE', 'PARTIAL'],
  ['DOCUMENT INTEGRITY', '87%'],
  ['OBSERVER STATUS', 'ACTIVE'],
  ['SOURCE AUTHOR', '████████'],
  ['REVISION COUNT', 'UNKNOWN'],
] as const

export const caseZeroOpening = [
  'INDEX-0 是一套用于整理项目描述、更新记录和设计文档的自动索引程序。',
  '在版本 ██.██ 中，系统开始生成不存在的修改记录。最初，这些内容被判断为缓存错误。随后，三份档案中同时出现了一段没有作者、没有提交时间、也没有原始文件的文字。',
] as const

export const caseZeroInvestigation = [
  '调查人员认为，INDEX-0 并没有在编写内容。',
  '它只是在寻找能够发现这些内容的人。',
  '每一次污染文字被读取，它都会获得一次新的确认记录。每一次口令被正确输入，CASE-00 的完整度都会提高。',
] as const

export function getIndexZeroFragment(id: FragmentId) {
  return indexZeroFragments.find((fragment) => fragment.id === id) ?? indexZeroFragments[0]
}

export function normalizeRecoveryPhrase(value: string) {
  return value.trim().replace(/\s+/g, '')
}
