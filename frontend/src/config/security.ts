/**
 * Configuração de Content Security Policy (CSP) para maior segurança
 * 
 * Este arquivo contém as configurações de segurança que devem ser implementadas
 * no servidor web ou através de meta tags no HTML.
 */

/**
 * Meta tag CSP para ser adicionada no HTML
 * Esta configuração deve ser colocada no <head> do index.html
 */
export const CSP_META_TAG = `
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' http://localhost:3001 https://api.connexa.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
">
`;

/**
 * Headers de segurança para configurar no servidor Express
 */
export const SECURITY_HEADERS = {
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' http://localhost:3001 https://api.connexa.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; '),

    // Previne ataques XSS
    'X-XSS-Protection': '1; mode=block',

    // Previne MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Previne que a página seja carregada em frames (clickjacking)
    'X-Frame-Options': 'DENY',

    // HSTS - Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Controla informações no header Referer
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Controla recursos que podem ser carregados
    'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()'
    ].join(', ')
};

/**
 * Função para aplicar headers de segurança no Express
 * Adicione esta função no seu middleware do Express
 */
export const applySecurityHeaders = (req: any, res: any, next: any) => {
    // Aplicar todos os headers de segurança
    Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    next();
};

/**
 * Configurações específicas para desenvolvimento
 */
export const DEVELOPMENT_CSP = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: http:",
        "connect-src 'self' http://localhost:* ws://localhost:* https://api.connexa.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ')
};

/**
 * Configurações específicas para produção
 */
export const PRODUCTION_CSP = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' https://cdn.jsdelivr.net",
        "style-src 'self' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.connexa.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; ')
};

/**
 * Instruções de implementação:
 * 
 * 1. Frontend (React):
 *    - Adicione a meta tag CSP no public/index.html
 *    - Use as configurações de desenvolvimento local
 * 
 * 2. Backend (Express):
 *    - Importe e use applySecurityHeaders como middleware
 *    - Configure diferentes policies para dev/prod
 * 
 * 3. Servidor Web (Nginx/Apache):
 *    - Configure os headers diretamente no servidor
 *    - Use as configurações de produção
 * 
 * Exemplo de uso no Express:
 * ```javascript
 * import { applySecurityHeaders } from './security/csp';
 * app.use(applySecurityHeaders);
 * ```
 * 
 * Exemplo de meta tag no HTML:
 * ```html
 * <meta http-equiv="Content-Security-Policy" content="default-src 'self'; ...">
 * ```
 */