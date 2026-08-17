import { Code, ExternalLink, Mail, MessageSquare, Phone, User, Briefcase, GraduationCap, Github } from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  imageUrl?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string[];
}

export interface CampusExperience {
  organization: string;
  role: string;
  period: string;
  description: string[];
}

export interface Award {
  title: string;
  level: string;
  date: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  period: string;
  gpa: string;
  details: string[];
  url?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'aetherquant',
    title: 'AetherQuant - AI 量化投研分析平台',
    description: '面向金融投资与量化研究的智能分析平台，集成多维度数据回测、行情监控及量化策略辅助。',
    tags: ['量化金融', 'AI投研', '数据分析'],
    link: 'https://aetherquant.eren9523.fun/',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'finance-assistant',
    title: '金融大模型推荐助手',
    description: '基于大语言模型的智能金融决策与产品推荐助手，提供精准的问答、风险评估与资产配置建议。',
    tags: ['金融科技', '大模型', '智能推荐'],
    link: 'https://finance.eren9523.fun/',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'web-agent',
    title: 'Web Agent - 在线 AI 智能代理',
    description: '极致轻量化、无需部署、随时随地在网页端开启的 AI 助手。主打超快响应速度与极简操作体验，为您提供即时、高效的智能化在线支持。',
    tags: ['AI/LLM', '在线助手', '生产力'],
    link: '/chat',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'ecom-calc',
    title: 'E-Metric - 电商运营全能计算器',
    description: '电商专家级的指标分析工具。内置 GMV、CVR、ROI、CPC 等 30+ 核心公式，深度集成跨境电商物流成本与汇率波动模型，助力数据驱动决策。',
    tags: ['电商', '数据分析', '工具'],
    link: '/ecom-calc',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'open-claw',
    title: '茶茶 Open Claw - 本地 AI 智能体 (文件深控版)',
    description: '基于 Open Claw 自主代理架构的本地化硬核助手。深度集成底层文件系统，具备极强的环境感知与任务规划能力，支持毫秒级本地文件读写、格式转换与目录自动化管理。',
    tags: ['AI/LLM', 'Open Claw', '本地自动化'],
    github: 'https://github.com/Eren9523/SLFP',
    imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'sheet-flow',
    title: 'SheetFlow - 智能表格自动化',
    description: '办公自动化神器。基于 SheetJS 架构，实现浏览器端轻量化 Excel 处理。支持 VLOOKUP 批量匹配、自动化数据透视及 90% 常用办公公式的一键生成。',
    tags: ['数据处理', '办公自动化', '算法'],
    link: '/sheet-flow',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'game-social',
    title: '第九空间 - 个人娱乐平台',
    description: '一个深度集成的个人娱乐中枢，连接多平台游戏数据，汇聚实时游戏资讯，并搭载专属语音服务器。这是我的第九艺术梦工厂。',
    tags: ['娱乐', '社区', '个人项目'],
    link: '/game-platform',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000'
  }
];

export const EXPERIENCES: Experience[] = [
  {
    company: '武汉初心科技有限公司（石墨文档）',
    role: 'AI 产品运营实习生 (运营部)',
    period: '2026.04 - 2026.06',
    description: [
      '参与 AI 情感陪伴产品「何意」的早期运营与上线推广，负责种子用户招募、跨平台引流及用户需求验证。',
      '负责抖音、小红书账号日常内容运营，打磨选题策划与文案撰写，推动产品种草和用户教育。',
      '参与用户与活动运营，协助策划拉新及互动活动，制作宣传海报，并维护群聊收集用户高频需求。',
      '参与情感陪伴赛道竞品战略调研，拆解 Character.AI 等竞品功能与商业化路径，辅助运营策略优化。'
    ]
  },
  {
    company: '壹药网科技（上海）股份有限公司',
    role: '平台运营实习生 (平台运营部)',
    period: '2025.12 - 2026.03',
    description: [
      '负责商家全生命周期运营，完成采销对接、资质审核与开户全流程，搭建标准化入驻体系。',
      '1v1 对接商家需求，联动优化商品结构与权益配置，带动对接商家活跃度提升 28%。',
      '独立负责平台 MP 账号全流程运营，为商城活动累计引流超 15w 人次。',
      '搭建业务核心数据看板，跟踪动销率、转化率、活动 GMV 等核心指标并输出分析报告。'
    ]
  },
  {
    company: '新东方教育科技集团',
    role: '产品运营实习生 (大学事业部)',
    period: '2025.07 - 2025.12',
    description: [
      '联动课程产品与市场跨部门团队，设计并落地 10 余场校园宣讲会及学习打卡营活动。',
      '独立完成宣传素材拍摄、视频剪辑与文案优化，累计产出推广短片 18 条，整体触达超 2.5 万人次。',
      '负责用户数据整理沉淀，参与活动复盘，提炼优化点反哺运营策略迭代。'
    ]
  },
  {
    company: '亿家购科技有限公司',
    role: '跨境电商运营实习生 (运营部)',
    period: '2025.07 - 2025.09',
    description: [
      '独立负责 Facebook 平台广告全流程运营，包括内容策划剪辑、受众分层与投放设置。',
      '搭建投放数据监测体系，利用 ROI、转化率等指标快速识别数据异常并管控投放成本。',
      '通过对不同素材和受众的转化差异总结规律，优化后投放 ROI 均值达 1:3.2，较初始提升 45%。'
    ]
  }
];

export const EDUCATION: Education[] = [
  {
    school: '中南财经政法大学',
    degree: '硕士',
    major: '农村发展',
    period: '2025.09 - 至今',
    gpa: '3.87/4.0',
    details: [
      '相关课程：货币金融学、西方经济学、人工智能与应用（数据分析基础）。'
    ],
    url: 'https://www.zuel.edu.cn/'
  },
  {
    school: '湖北第二师范学院',
    degree: '学士',
    major: '电子商务',
    period: '2021.09 - 2025.07',
    gpa: '3.1/4.0',
    details: [
      '相关课程：Web 前端开发、数据库原理、数据采集与清洗、统计学基础。'
    ],
    url: 'https://www.hue.edu.cn/'
  }
];

export const CAMPUS_EXPERIENCES: CampusExperience[] = [
  {
    organization: '中南财经政法大学',
    role: '研究生协会学术研究中心成员 / 班级心理委员',
    period: '2025.09 - 至今',
    description: [
      '参与统筹学术活动的策划与执行工作，推进学术平台的内容建设与活动开展。',
      '作为班级心理委员，定期了解同学们心理健康状况，组织并开展班级心理健康教育相关的特色活动。'
    ]
  },
  {
    organization: '湖北第二师范学院',
    role: '学生会校心理信息部部长',
    period: '2022.09 - 2024.06',
    description: [
      '统筹校心理信息部日常运营，带领干事完成各阶段校级心理健康知识普及与推广工作。',
      '成功组织策划多次大型心理健康周、心理嘉年华等校园活动，并在校内外产生积极反响。',
      '搭建并完善各学院心理信息网对接机制，负责日常宣传、干事培训与考核工作。'
    ]
  }
];

export const AWARDS: Award[] = [
  {
    title: '“挑战杯”中国大学生课外学术科技作品竞赛',
    level: '全国三等奖',
    date: '2023.11'
  },
  {
    title: '“互联网+”大学生创新创业大赛',
    level: '省级三等奖',
    date: '2023.08'
  },
  {
    title: '研究生学业奖学金',
    level: '一等奖',
    date: '2025.10'
  },
  {
    title: '湖北第二师范学院',
    level: '优秀毕业生 / 院级奖学金',
    date: '2025.06'
  }
];

