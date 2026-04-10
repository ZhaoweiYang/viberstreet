import React, { createContext, useContext, useState, ReactNode } from 'react';

export const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const t_en: Record<string, string> = {
  'sidebar.dashboard': 'Dashboard', 'sidebar.my_products': 'My Products', 'sidebar.create_product': 'Create Product', 'sidebar.logout': 'Logout',
  'dashboard.title': 'Dashboard', 'dashboard.total_products': 'Total Products', 'dashboard.published': 'Published', 'dashboard.total_downloads': 'Total Downloads', 'dashboard.revenue': 'Revenue', 'dashboard.recent_products': 'Recent Products', 'dashboard.create_new': 'Create New Product', 'dashboard.view_all': 'View All Products',
  'products.title': 'My Products', 'products.create': 'Create Product', 'products.no_products': 'No products yet',
  'status.draft': 'Draft', 'status.published': 'Published', 'status.unpublished': 'Unpublished', 'status.pending_review': 'Pending Review', 'status.approved': 'Approved', 'status.rejected': 'Rejected', 'status.revoked': 'Revoked',
  'create.title': 'Create New Product', 'create.name': 'Product Name', 'create.description': 'Description', 'create.platform': 'Platform', 'create.product_type': 'Product Type', 'create.price': 'Price (USD)', 'create.price_hint': 'Set to 0 for free', 'create.version': 'Initial Version', 'create.changelog': 'Changelog', 'create.documentation': 'Documentation Content', 'create.doc_placeholder': 'Paste your AI vibe coding documentation here...', 'create.avatar': 'Product Avatar', 'create.screenshots': 'Screenshots', 'create.submit': 'Create & Submit for Review', 'create.submitting': 'Submitting...',
  'detail.edit': 'Edit Product', 'detail.save': 'Save Changes', 'detail.cancel': 'Cancel', 'detail.publish': 'Publish', 'detail.unpublish': 'Unpublish', 'detail.new_version': 'Submit New Version', 'detail.versions': 'Version History', 'detail.downloads': 'Downloads', 'detail.revenue': 'Revenue', 'detail.review_note': 'Review Note',
  'version.title': 'Submit New Version', 'version.number': 'Version Number', 'version.changelog': 'Changelog', 'version.documentation': 'Documentation Content', 'version.screenshots': 'Screenshots', 'version.submit': 'Submit for Review', 'version.submitting': 'Submitting...',
  'login.title': 'Developer Portal', 'login.subtitle': 'Sell your AI Vibe Coding blueprints', 'login.email': 'Email', 'login.name': 'Name', 'login.send_code': 'Send Code', 'login.code_sent': 'Code sent!', 'login.verification_code': 'Verification Code', 'login.verify': 'Verify & Login', 'login.google': 'Continue with Google',
  'platform.web': 'Web', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': 'Browser', 'product_type.vpn': 'VPN', 'product_type.input-method': 'Input Method', 'product_type.finance': 'Finance', 'product_type.office': 'Office', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 Wallet', 'product_type.email-client': 'Email Client', 'product_type.dao-message': 'DAOmessage',
  'common.loading': 'Loading...', 'common.error': 'Something went wrong', 'common.save': 'Save', 'common.back': 'Back', 'common.free': 'Free',
};

const t_zh: Record<string, string> = {
  'sidebar.dashboard': '仪表盘', 'sidebar.my_products': '我的产品', 'sidebar.create_product': '创建产品', 'sidebar.logout': '退出登录',
  'dashboard.title': '仪表盘', 'dashboard.total_products': '产品总数', 'dashboard.published': '已上架', 'dashboard.total_downloads': '总下载量', 'dashboard.revenue': '收入', 'dashboard.recent_products': '最近产品', 'dashboard.create_new': '创建新产品', 'dashboard.view_all': '查看所有产品',
  'products.title': '我的产品', 'products.create': '创建产品', 'products.no_products': '暂无产品',
  'status.draft': '草稿', 'status.published': '已上架', 'status.unpublished': '已下架', 'status.pending_review': '审核中', 'status.approved': '已通过', 'status.rejected': '已拒绝', 'status.revoked': '已撤销',
  'create.title': '创建新产品', 'create.name': '产品名称', 'create.description': '描述', 'create.platform': '平台', 'create.product_type': '产品类型', 'create.price': '价格（美元）', 'create.price_hint': '设为0即免费', 'create.version': '初始版本', 'create.changelog': '更新日志', 'create.documentation': '文档内容', 'create.doc_placeholder': '在此粘贴你的 AI Vibe Coding 文档...', 'create.avatar': '产品头像', 'create.screenshots': '截图', 'create.submit': '创建并提交审核', 'create.submitting': '提交中...',
  'detail.edit': '编辑产品', 'detail.save': '保存更改', 'detail.cancel': '取消', 'detail.publish': '上架', 'detail.unpublish': '下架', 'detail.new_version': '提交新版本', 'detail.versions': '版本历史', 'detail.downloads': '下载量', 'detail.revenue': '收入', 'detail.review_note': '审核备注',
  'version.title': '提交新版本', 'version.number': '版本号', 'version.changelog': '更新日志', 'version.documentation': '文档内容', 'version.screenshots': '截图', 'version.submit': '提交审核', 'version.submitting': '提交中...',
  'login.title': '开发者门户', 'login.subtitle': '销售你的 AI Vibe Coding 蓝图', 'login.email': '邮箱', 'login.name': '名称', 'login.send_code': '发送验证码', 'login.code_sent': '验证码已发送！', 'login.verification_code': '验证码', 'login.verify': '验证并登录', 'login.google': '使用 Google 登录',
  'platform.web': 'Web 网页', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': '浏览器', 'product_type.vpn': 'VPN', 'product_type.input-method': '输入法', 'product_type.finance': '财务软件', 'product_type.office': '办公软件', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 钱包', 'product_type.email-client': '邮件客户端', 'product_type.dao-message': 'DAOmessage',
  'common.loading': '加载中...', 'common.error': '出错了', 'common.save': '保存', 'common.back': '返回', 'common.free': '免费',
};

const t_ru: Record<string, string> = {
  'sidebar.dashboard': 'Панель', 'sidebar.my_products': 'Мои продукты', 'sidebar.create_product': 'Создать продукт', 'sidebar.logout': 'Выйти',
  'dashboard.title': 'Панель управления', 'dashboard.total_products': 'Всего продуктов', 'dashboard.published': 'Опубликовано', 'dashboard.total_downloads': 'Всего загрузок', 'dashboard.revenue': 'Доход', 'dashboard.recent_products': 'Последние продукты', 'dashboard.create_new': 'Создать новый', 'dashboard.view_all': 'Все продукты',
  'products.title': 'Мои продукты', 'products.create': 'Создать', 'products.no_products': 'Продуктов пока нет',
  'status.draft': 'Черновик', 'status.published': 'Опубликовано', 'status.unpublished': 'Снято', 'status.pending_review': 'На проверке', 'status.approved': 'Одобрено', 'status.rejected': 'Отклонено', 'status.revoked': 'Отозвано',
  'create.title': 'Создать продукт', 'create.name': 'Название', 'create.description': 'Описание', 'create.platform': 'Платформа', 'create.product_type': 'Тип продукта', 'create.price': 'Цена (USD)', 'create.price_hint': '0 = бесплатно', 'create.version': 'Версия', 'create.changelog': 'Изменения', 'create.documentation': 'Документация', 'create.doc_placeholder': 'Вставьте документацию...', 'create.avatar': 'Аватар', 'create.screenshots': 'Скриншоты', 'create.submit': 'Создать и отправить на проверку', 'create.submitting': 'Отправка...',
  'detail.edit': 'Редактировать', 'detail.save': 'Сохранить', 'detail.cancel': 'Отмена', 'detail.publish': 'Опубликовать', 'detail.unpublish': 'Снять', 'detail.new_version': 'Новая версия', 'detail.versions': 'История версий', 'detail.downloads': 'Загрузки', 'detail.revenue': 'Доход', 'detail.review_note': 'Заметка рецензента',
  'version.title': 'Новая версия', 'version.number': 'Номер версии', 'version.changelog': 'Изменения', 'version.documentation': 'Документация', 'version.screenshots': 'Скриншоты', 'version.submit': 'Отправить на проверку', 'version.submitting': 'Отправка...',
  'login.title': 'Портал разработчика', 'login.subtitle': 'Продавайте свои чертежи', 'login.email': 'Эл. почта', 'login.name': 'Имя', 'login.send_code': 'Отправить код', 'login.code_sent': 'Код отправлен!', 'login.verification_code': 'Код подтверждения', 'login.verify': 'Подтвердить', 'login.google': 'Войти через Google',
  'platform.web': 'Web', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': 'Браузер', 'product_type.vpn': 'VPN', 'product_type.input-method': 'Метод ввода', 'product_type.finance': 'Финансы', 'product_type.office': 'Офис', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 Кошелёк', 'product_type.email-client': 'Почта', 'product_type.dao-message': 'DAOmessage',
  'common.loading': 'Загрузка...', 'common.error': 'Произошла ошибка', 'common.save': 'Сохранить', 'common.back': 'Назад', 'common.free': 'Бесплатно',
};

const translations: Record<string, Record<string, string>> = {
  en: t_en, zh: t_zh, ru: t_ru,
  fr: { ...t_en, 'sidebar.dashboard': 'Tableau de bord', 'sidebar.my_products': 'Mes produits', 'sidebar.create_product': 'Créer un produit', 'sidebar.logout': 'Déconnexion', 'dashboard.title': 'Tableau de bord', 'dashboard.total_products': 'Produits totaux', 'dashboard.published': 'Publiés', 'dashboard.total_downloads': 'Téléchargements', 'dashboard.revenue': 'Revenus', 'products.title': 'Mes produits', 'create.title': 'Créer un produit', 'create.platform': 'Plateforme', 'create.product_type': 'Type de produit', 'create.submit': 'Créer et soumettre', 'detail.publish': 'Publier', 'detail.unpublish': 'Retirer', 'login.title': 'Portail développeur', 'common.loading': 'Chargement...', 'common.free': 'Gratuit', 'product_type.browser': 'Navigateur', 'product_type.finance': 'Finance', 'product_type.office': 'Bureautique', 'product_type.web3-wallet': 'Portefeuille Web3', 'product_type.email-client': 'Client mail' },
  pt: { ...t_en, 'sidebar.dashboard': 'Painel', 'sidebar.my_products': 'Meus produtos', 'sidebar.create_product': 'Criar produto', 'sidebar.logout': 'Sair', 'dashboard.title': 'Painel', 'dashboard.total_products': 'Total de produtos', 'dashboard.published': 'Publicados', 'dashboard.total_downloads': 'Downloads', 'dashboard.revenue': 'Receita', 'products.title': 'Meus produtos', 'create.title': 'Criar produto', 'create.platform': 'Plataforma', 'create.product_type': 'Tipo de produto', 'create.submit': 'Criar e enviar para revisão', 'login.title': 'Portal do desenvolvedor', 'common.loading': 'Carregando...', 'common.free': 'Grátis', 'product_type.browser': 'Navegador', 'product_type.finance': 'Finanças', 'product_type.office': 'Escritório', 'product_type.web3-wallet': 'Carteira Web3', 'product_type.email-client': 'Cliente de e-mail' },
  es: { ...t_en, 'sidebar.dashboard': 'Panel', 'sidebar.my_products': 'Mis productos', 'sidebar.create_product': 'Crear producto', 'sidebar.logout': 'Cerrar sesión', 'dashboard.title': 'Panel', 'dashboard.total_products': 'Total de productos', 'dashboard.published': 'Publicados', 'dashboard.total_downloads': 'Descargas', 'dashboard.revenue': 'Ingresos', 'products.title': 'Mis productos', 'create.title': 'Crear producto', 'create.platform': 'Plataforma', 'create.product_type': 'Tipo de producto', 'create.submit': 'Crear y enviar a revisión', 'login.title': 'Portal de desarrollador', 'common.loading': 'Cargando...', 'common.free': 'Gratis', 'product_type.browser': 'Navegador', 'product_type.finance': 'Finanzas', 'product_type.office': 'Oficina', 'product_type.web3-wallet': 'Billetera Web3', 'product_type.email-client': 'Cliente de correo' },
  ja: { ...t_en, 'sidebar.dashboard': 'ダッシュボード', 'sidebar.my_products': 'マイ製品', 'sidebar.create_product': '製品を作成', 'sidebar.logout': 'ログアウト', 'dashboard.title': 'ダッシュボード', 'dashboard.total_products': '製品数', 'dashboard.published': '公開中', 'dashboard.total_downloads': 'ダウンロード数', 'dashboard.revenue': '収益', 'products.title': 'マイ製品', 'create.title': '新製品を作成', 'create.platform': 'プラットフォーム', 'create.product_type': '製品タイプ', 'create.submit': '作成して審査に提出', 'login.title': '開発者ポータル', 'common.loading': '読み込み中...', 'common.free': '無料', 'product_type.browser': 'ブラウザ', 'product_type.finance': '財務', 'product_type.office': 'オフィス', 'product_type.web3-wallet': 'Web3ウォレット', 'product_type.email-client': 'メールクライアント', 'product_type.input-method': '入力方式', 'status.draft': '下書き', 'status.published': '公開中', 'status.unpublished': '非公開', 'status.pending_review': '審査中', 'status.approved': '承認済み', 'status.rejected': '却下', 'status.revoked': '取り消し' },
  ko: { ...t_en, 'sidebar.dashboard': '대시보드', 'sidebar.my_products': '내 제품', 'sidebar.create_product': '제품 만들기', 'sidebar.logout': '로그아웃', 'dashboard.title': '대시보드', 'dashboard.total_products': '전체 제품', 'dashboard.published': '게시됨', 'dashboard.total_downloads': '다운로드', 'dashboard.revenue': '수익', 'products.title': '내 제품', 'create.title': '새 제품 만들기', 'create.platform': '플랫폼', 'create.product_type': '제품 유형', 'create.submit': '만들고 심사 제출', 'login.title': '개발자 포털', 'common.loading': '로딩 중...', 'common.free': '무료', 'product_type.browser': '브라우저', 'product_type.finance': '금융', 'product_type.office': '오피스', 'product_type.web3-wallet': 'Web3 지갑', 'product_type.email-client': '이메일 클라이언트', 'product_type.input-method': '입력기', 'status.draft': '초안', 'status.published': '게시됨', 'status.unpublished': '비공개', 'status.pending_review': '심사 중', 'status.approved': '승인됨', 'status.rejected': '거절됨', 'status.revoked': '취소됨' },
};

function detectLocale(): string {
  const stored = localStorage.getItem('dev_portal_lang');
  if (stored && translations[stored]) return stored;
  const bl = navigator.language.split('-')[0];
  return translations[bl] ? bl : 'en';
}

interface I18nCtx { t: (k: string) => string; locale: string; setLocale: (l: string) => void; locales: typeof locales; }

const I18nContext = createContext<I18nCtx>({ t: (k) => k, locale: 'en', setLocale: () => {}, locales });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(detectLocale);
  const setLocale = (l: string) => { setLocaleState(l); localStorage.setItem('dev_portal_lang', l); };
  const t = (k: string) => translations[locale]?.[k] || translations['en']?.[k] || k;
  return <I18nContext.Provider value={{ t, locale, setLocale, locales }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
