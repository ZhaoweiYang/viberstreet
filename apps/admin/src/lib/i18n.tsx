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
  'sidebar.dashboard': 'Dashboard', 'sidebar.reviews': 'Review Queue', 'sidebar.products': 'Products', 'sidebar.users': 'Users', 'sidebar.logout': 'Logout', 'sidebar.pending': 'pending',
  'dashboard.title': 'Admin Dashboard', 'dashboard.total_products': 'Total Products', 'dashboard.pending_reviews': 'Pending Reviews', 'dashboard.total_users': 'Total Users', 'dashboard.total_revenue': 'Total Revenue', 'dashboard.recent_pending': 'Recent Pending Reviews', 'dashboard.view_all_reviews': 'View All Reviews', 'dashboard.no_pending': 'No pending reviews',
  'reviews.title': 'Review Queue', 'reviews.pending': 'Pending', 'reviews.approved': 'Approved', 'reviews.rejected': 'Rejected', 'reviews.revoked': 'Revoked', 'reviews.product': 'Product', 'reviews.version': 'Version', 'reviews.developer': 'Developer', 'reviews.platform': 'Platform', 'reviews.product_type': 'Type', 'reviews.submitted': 'Submitted', 'reviews.status': 'Status', 'reviews.actions': 'Actions', 'reviews.review': 'Review', 'reviews.no_reviews': 'No reviews found',
  'review.title': 'Review Version', 'review.product_info': 'Product Information', 'review.version_info': 'Version Details', 'review.changelog': 'Changelog', 'review.documentation': 'Documentation', 'review.screenshots': 'Screenshots', 'review.approve': 'Approve', 'review.reject': 'Reject', 'review.revoke': 'Revoke', 'review.reject_note': 'Rejection reason (required)', 'review.revoke_confirm': 'Are you sure? This will unpublish the product.', 'review.submitting': 'Submitting...',
  'products.title': 'All Products', 'products.all': 'All', 'products.draft': 'Draft', 'products.published': 'Published', 'products.unpublished': 'Unpublished', 'products.name': 'Name', 'products.developer': 'Developer', 'products.platform': 'Platform', 'products.product_type': 'Type', 'products.status': 'Status', 'products.price': 'Price', 'products.downloads': 'Downloads', 'products.created': 'Created', 'products.no_products': 'No products found', 'products.free': 'Free',
  'users.title': 'User Management', 'users.name': 'Name', 'users.email': 'Email', 'users.role': 'Role', 'users.joined': 'Joined', 'users.role_user': 'User', 'users.role_developer': 'Developer', 'users.role_admin': 'Admin', 'users.no_users': 'No users found',
  'login.title': 'Admin Portal', 'login.subtitle': 'Viber Street Administration', 'login.email': 'Email', 'login.send_code': 'Send Code', 'login.code_sent': 'Code sent!', 'login.verification_code': 'Verification Code', 'login.verify': 'Verify & Login', 'login.google': 'Continue with Google', 'login.admin_only': 'Admin access only',
  'platform.web': 'Web', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': 'Browser', 'product_type.vpn': 'VPN', 'product_type.input-method': 'Input Method', 'product_type.finance': 'Finance', 'product_type.office': 'Office', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 Wallet', 'product_type.email-client': 'Email Client',
  'common.loading': 'Loading...', 'common.error': 'Something went wrong', 'common.back': 'Back', 'common.search': 'Search...', 'common.previous': 'Previous', 'common.next': 'Next',
};

const t_zh: Record<string, string> = {
  'sidebar.dashboard': '仪表盘', 'sidebar.reviews': '审核队列', 'sidebar.products': '产品', 'sidebar.users': '用户', 'sidebar.logout': '退出', 'sidebar.pending': '待审核',
  'dashboard.title': '管理后台', 'dashboard.total_products': '产品总数', 'dashboard.pending_reviews': '待审核', 'dashboard.total_users': '用户总数', 'dashboard.total_revenue': '总收入', 'dashboard.recent_pending': '最近待审核', 'dashboard.view_all_reviews': '查看所有审核', 'dashboard.no_pending': '暂无待审核',
  'reviews.title': '审核队列', 'reviews.pending': '待审核', 'reviews.approved': '已通过', 'reviews.rejected': '已拒绝', 'reviews.revoked': '已撤销', 'reviews.product': '产品', 'reviews.version': '版本', 'reviews.developer': '开发者', 'reviews.platform': '平台', 'reviews.product_type': '类型', 'reviews.submitted': '提交时间', 'reviews.status': '状态', 'reviews.actions': '操作', 'reviews.review': '审核', 'reviews.no_reviews': '暂无审核记录',
  'review.title': '审核版本', 'review.product_info': '产品信息', 'review.version_info': '版本详情', 'review.changelog': '更新日志', 'review.documentation': '文档', 'review.screenshots': '截图', 'review.approve': '通过', 'review.reject': '拒绝', 'review.revoke': '撤销', 'review.reject_note': '拒绝原因（必填）', 'review.revoke_confirm': '确定要撤销吗？这将导致产品下架。', 'review.submitting': '提交中...',
  'products.title': '所有产品', 'products.all': '全部', 'products.draft': '草稿', 'products.published': '已上架', 'products.unpublished': '已下架', 'products.name': '名称', 'products.developer': '开发者', 'products.platform': '平台', 'products.product_type': '类型', 'products.status': '状态', 'products.price': '价格', 'products.downloads': '下载量', 'products.created': '创建时间', 'products.no_products': '暂无产品', 'products.free': '免费',
  'users.title': '用户管理', 'users.name': '名称', 'users.email': '邮箱', 'users.role': '角色', 'users.joined': '注册时间', 'users.role_user': '用户', 'users.role_developer': '开发者', 'users.role_admin': '管理员', 'users.no_users': '暂无用户',
  'login.title': '管理后台', 'login.subtitle': 'Viber Street 管理', 'login.email': '邮箱', 'login.send_code': '发送验证码', 'login.code_sent': '验证码已发送！', 'login.verification_code': '验证码', 'login.verify': '验证并登录', 'login.google': '使用 Google 登录', 'login.admin_only': '仅管理员可访问',
  'platform.web': 'Web', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': '浏览器', 'product_type.vpn': 'VPN', 'product_type.input-method': '输入法', 'product_type.finance': '财务软件', 'product_type.office': '办公软件', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 钱包', 'product_type.email-client': '邮件客户端',
  'common.loading': '加载中...', 'common.error': '出错了', 'common.back': '返回', 'common.search': '搜索...', 'common.previous': '上一页', 'common.next': '下一页',
};

const t_ru: Record<string, string> = {
  'sidebar.dashboard': 'Панель', 'sidebar.reviews': 'Очередь проверки', 'sidebar.products': 'Продукты', 'sidebar.users': 'Пользователи', 'sidebar.logout': 'Выйти', 'sidebar.pending': 'ожидает',
  'dashboard.title': 'Панель администратора', 'dashboard.total_products': 'Всего продуктов', 'dashboard.pending_reviews': 'На проверке', 'dashboard.total_users': 'Пользователей', 'dashboard.total_revenue': 'Общий доход', 'dashboard.recent_pending': 'Последние на проверке', 'dashboard.view_all_reviews': 'Все проверки', 'dashboard.no_pending': 'Нет ожидающих проверки',
  'reviews.title': 'Очередь проверки', 'reviews.pending': 'Ожидает', 'reviews.approved': 'Одобрено', 'reviews.rejected': 'Отклонено', 'reviews.revoked': 'Отозвано', 'reviews.product': 'Продукт', 'reviews.version': 'Версия', 'reviews.developer': 'Разработчик', 'reviews.platform': 'Платформа', 'reviews.product_type': 'Тип', 'reviews.submitted': 'Подано', 'reviews.no_reviews': 'Проверок не найдено',
  'review.approve': 'Одобрить', 'review.reject': 'Отклонить', 'review.revoke': 'Отозвать', 'review.reject_note': 'Причина отклонения', 'review.revoke_confirm': 'Вы уверены? Продукт будет снят с публикации.',
  'products.title': 'Все продукты', 'products.all': 'Все', 'products.draft': 'Черновик', 'products.published': 'Опубликовано', 'products.unpublished': 'Снято', 'products.free': 'Бесплатно',
  'users.title': 'Управление пользователями', 'users.role_user': 'Пользователь', 'users.role_developer': 'Разработчик', 'users.role_admin': 'Админ',
  'login.title': 'Админ-портал', 'login.email': 'Эл. почта', 'login.send_code': 'Отправить код', 'login.verify': 'Подтвердить',
  'platform.web': 'Web', 'platform.ios': 'iOS', 'platform.android': 'Android', 'platform.macos': 'macOS', 'platform.windows': 'Windows',
  'product_type.browser': 'Браузер', 'product_type.vpn': 'VPN', 'product_type.input-method': 'Метод ввода', 'product_type.finance': 'Финансы', 'product_type.office': 'Офис', 'product_type.erp': 'ERP', 'product_type.web3-wallet': 'Web3 Кошелёк', 'product_type.email-client': 'Почта',
  'common.loading': 'Загрузка...', 'common.back': 'Назад', 'common.previous': 'Назад', 'common.next': 'Далее',
};

const translations: Record<string, Record<string, string>> = {
  en: t_en, zh: t_zh, ru: { ...t_en, ...t_ru },
  fr: { ...t_en, 'sidebar.dashboard': 'Tableau de bord', 'sidebar.reviews': 'File de révision', 'sidebar.products': 'Produits', 'sidebar.users': 'Utilisateurs', 'sidebar.logout': 'Déconnexion', 'dashboard.title': 'Administration', 'reviews.title': 'File de révision', 'review.approve': 'Approuver', 'review.reject': 'Rejeter', 'review.revoke': 'Révoquer', 'products.title': 'Tous les produits', 'users.title': 'Gestion des utilisateurs', 'login.title': 'Portail admin', 'common.loading': 'Chargement...', 'products.free': 'Gratuit', 'product_type.browser': 'Navigateur', 'product_type.finance': 'Finance', 'product_type.office': 'Bureautique', 'product_type.web3-wallet': 'Portefeuille Web3', 'product_type.email-client': 'Client mail' },
  pt: { ...t_en, 'sidebar.dashboard': 'Painel', 'sidebar.reviews': 'Fila de revisão', 'sidebar.products': 'Produtos', 'sidebar.users': 'Usuários', 'sidebar.logout': 'Sair', 'dashboard.title': 'Administração', 'reviews.title': 'Fila de revisão', 'review.approve': 'Aprovar', 'review.reject': 'Rejeitar', 'review.revoke': 'Revogar', 'products.title': 'Todos os produtos', 'users.title': 'Gerenciamento de usuários', 'login.title': 'Portal admin', 'common.loading': 'Carregando...', 'products.free': 'Grátis', 'product_type.browser': 'Navegador', 'product_type.finance': 'Finanças', 'product_type.office': 'Escritório', 'product_type.web3-wallet': 'Carteira Web3', 'product_type.email-client': 'Cliente de e-mail' },
  es: { ...t_en, 'sidebar.dashboard': 'Panel', 'sidebar.reviews': 'Cola de revisión', 'sidebar.products': 'Productos', 'sidebar.users': 'Usuarios', 'sidebar.logout': 'Cerrar sesión', 'dashboard.title': 'Administración', 'reviews.title': 'Cola de revisión', 'review.approve': 'Aprobar', 'review.reject': 'Rechazar', 'review.revoke': 'Revocar', 'products.title': 'Todos los productos', 'users.title': 'Gestión de usuarios', 'login.title': 'Portal admin', 'common.loading': 'Cargando...', 'products.free': 'Gratis', 'product_type.browser': 'Navegador', 'product_type.finance': 'Finanzas', 'product_type.office': 'Oficina', 'product_type.web3-wallet': 'Billetera Web3', 'product_type.email-client': 'Cliente de correo' },
  ja: { ...t_en, 'sidebar.dashboard': 'ダッシュボード', 'sidebar.reviews': '審査キュー', 'sidebar.products': '製品', 'sidebar.users': 'ユーザー', 'sidebar.logout': 'ログアウト', 'dashboard.title': '管理ダッシュボード', 'reviews.title': '審査キュー', 'review.approve': '承認', 'review.reject': '却下', 'review.revoke': '取消', 'products.title': '全製品', 'users.title': 'ユーザー管理', 'login.title': '管理ポータル', 'common.loading': '読み込み中...', 'products.free': '無料', 'product_type.browser': 'ブラウザ', 'product_type.finance': '財務', 'product_type.office': 'オフィス', 'product_type.web3-wallet': 'Web3ウォレット', 'product_type.email-client': 'メール', 'product_type.input-method': '入力方式' },
  ko: { ...t_en, 'sidebar.dashboard': '대시보드', 'sidebar.reviews': '심사 대기열', 'sidebar.products': '제품', 'sidebar.users': '사용자', 'sidebar.logout': '로그아웃', 'dashboard.title': '관리 대시보드', 'reviews.title': '심사 대기열', 'review.approve': '승인', 'review.reject': '거절', 'review.revoke': '취소', 'products.title': '전체 제품', 'users.title': '사용자 관리', 'login.title': '관리자 포털', 'common.loading': '로딩 중...', 'products.free': '무료', 'product_type.browser': '브라우저', 'product_type.finance': '금융', 'product_type.office': '오피스', 'product_type.web3-wallet': 'Web3 지갑', 'product_type.email-client': '이메일', 'product_type.input-method': '입력기' },
};

function detectLocale(): string {
  const stored = localStorage.getItem('admin_lang');
  if (stored && translations[stored]) return stored;
  const bl = navigator.language.split('-')[0];
  return translations[bl] ? bl : 'en';
}

interface I18nCtx { t: (k: string) => string; locale: string; setLocale: (l: string) => void; locales: typeof locales; }
const I18nContext = createContext<I18nCtx>({ t: (k) => k, locale: 'en', setLocale: () => {}, locales });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(detectLocale);
  const setLocale = (l: string) => { setLocaleState(l); localStorage.setItem('admin_lang', l); };
  const t = (k: string) => translations[locale]?.[k] || translations['en']?.[k] || k;
  return <I18nContext.Provider value={{ t, locale, setLocale, locales }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
