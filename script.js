document.getElementById('warpButton').onclick = function() {
    window.location.href = 'https://generator-warp.vercel.app/';
}

const configToggle = document.getElementById('config');
const configModal = document.getElementById('configModal');
const warpToggle = document.getElementById('warp');
const warpModal = document.getElementById('warpModal');
const closeModal = document.querySelector('.close');

warpToggle.addEventListener('change', function() {
  if (this.checked) {
    warpModal.style.display = 'block';
  }
});
closeModal.addEventListener('click', function() {
  warpModal.style.display = 'none';
  warpToggle.checked = false;
});
window.addEventListener('click', function(event) {
  if (event.target === warpModal) {
    warpModal.style.display = 'none';
    warpToggle.checked = false;
  }
});

// Обработчик для кнопки выбора конфига WARP
document.getElementById('selectWarpConfig').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.yaml,.yml';
  
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      warpModal.style.display = 'none';
    }
  });

  
  fileInput.click();
});

configToggle.addEventListener('change', function() {
  if (this.checked) {
    configModal.style.display = 'block';
  }
});
function closeConfigModal() {
  configModal.style.display = 'none';
  configToggle.checked = false;
}
window.addEventListener('click', function(event) {
  if (event.target === configModal) {
    closeConfigModal();
  }
});

// Обработчик для кнопки выбора другого конфига
document.getElementById('selectConfig').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.yaml,.yml';
  
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      configModal.style.display = 'none';
    }
  });
  

  
  fileInput.click();
});
// Высота textarea
var textarea = document.getElementsByTagName('textarea')[0];
textarea.addEventListener('input', resize); // Изменил на 'input' для более плавной работы

function resize() {
    const maxLines = 20; // Максимальное количество строк перед появлением скролла
    const lineHeight = 20; // Высота одной строки в пикселях (подберите под ваш стиль)
    const maxHeight = maxLines * lineHeight;
    
    this.style.height = 'auto'; // Сброс высоты
    const newHeight = Math.min(this.scrollHeight, maxHeight);
    
    this.style.height = newHeight + 'px';
    this.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden'; // Добавляем скролл при достижении лимита
}

// Инициализация при загрузке
resize.call(textarea);

// Окно для ошибок
const modal = document.createElement('div');
modal.id = 'errorModal';
modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const modalContent = document.createElement('div');
modalContent.style.cssText = `
    background-color: #3A3C4C;
    padding: 20px;
    border-radius: 5px;
    max-width: 80%;
    width: 400px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
`;

const modalText = document.createElement('p');
modalText.style.marginBottom = '20px';

const modalCloseBtn = document.createElement('button');
modalCloseBtn.textContent = 'Закрыть';
modalCloseBtn.onclick = () => modal.style.display = 'none';

modalContent.appendChild(modalText);
modalContent.appendChild(modalCloseBtn);
modal.appendChild(modalContent);
document.body.appendChild(modal);

function showError(message) {
    modalText.textContent = message;
    modal.style.display = 'flex';
}


// Функция конвертации
function convert() {
    const input = document.getElementById('yamlInput').value.trim();
    const outputTextarea = document.getElementById('yamlOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    if (!input) {
        showError('Ошибка: Введите ссылку на подписку для конвертации');
        return;
    }

    // Разделяем ввод по строкам
    const lines = input.split('\n').filter(line => line.trim());
    
    // Если только одна строка, обрабатываем как раньше
    if (lines.length === 1) {
        const singleLine = lines[0];
        let config;
        
        try {
            if (singleLine.startsWith('vless://')) {
                const proxy = parseVlessUri(singleLine);
                config = generateVlessConfig(proxy);
            } else if (singleLine.startsWith('vmess://')) {
                const proxy = parseVmessUri(singleLine);
                config = generateVmessConfig(proxy);
            } else if (singleLine.startsWith('ss://')) {
                const proxy = parseShadowsocksUri(singleLine);
                config = generateShadowsocksConfig(proxy);
            } else if (singleLine.startsWith('trojan://')) {
                const proxy = parseTrojanUri(singleLine);
                config = generateTrojanConfig(proxy);
            } else if (singleLine.startsWith('hysteria2://') || singleLine.startsWith('hy2://')) {
                const proxy = parseHysteria2Uri(singleLine);
                config = generateHysteria2Config(proxy);
            } else if (singleLine.startsWith('ssr://')) {
                config = "# Конфиг для SSR будет реализован позже\n# Введенная ссылка: " + singleLine;
            } else {
                if (!singleLine.startsWith('http://') && !singleLine.startsWith('https://')) {
                    showError('Внимание: Возможно вы допустили ошибку в ссылке на подписку. Она должна начинаться с http:// или https:// или названия протокола: vless:// и т.д.');
                }
                config = generateSubscriptionConfig(singleLine);
            }
        } catch (e) {
            showError('Ошибка при парсинге ссылки: ' + e.message);
            return;
        }
        
        outputTextarea.value = config;
        setupDownloadAndCopy(config);
        downloadBtnCT.classList.remove('hidden');
        return;
    }
    
    // Обработка множественных ссылок
    let proxies = [];
    let hasUnsupportedTypes = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        try {
            if (trimmedLine.startsWith('vless://')) {
                const proxy = parseVlessUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('vmess://')) {
                const proxy = parseVmessUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('ss://')) {
                const proxy = parseShadowsocksUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('trojan://')) {
                const proxy = parseTrojanUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('hysteria2://') || trimmedLine.startsWith('hy2://')) {
                const proxy = parseHysteria2Uri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('ssr://') || trimmedLine.startsWith('hysteria://') || 
                      trimmedLine.startsWith('tuic://') || trimmedLine.startsWith('wireguard://')) {
                hasUnsupportedTypes = true;
            } else if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
                showError('Ошибка: Множественные HTTP/HTTPS подписки пока не поддерживаются');
                return;
            } else {
                showError('Неподдерживаемый формат ссылки: ' + trimmedLine);
                return;
            }
        } catch (e) {
            showError('Ошибка при парсинге ссылки: ' + trimmedLine + '\n' + e.message);
            return;
        }
    }
    
    if (hasUnsupportedTypes) {
        showError('Ошибка: Поддержка множественных ссылок пока недоступна для некоторых типов протоколов');
        return;
    }
    
    if (proxies.length === 0) {
        showError('Не найдено валидных ссылок для конвертации');
        return;
    }
    
    // Генерируем общий конфиг
    const config = generateMultiProxyConfig(proxies);
    outputTextarea.value = config;
    setupDownloadAndCopy(config);
    downloadBtnCT.classList.remove('hidden');
}

function generateSubscriptionConfig(url) {
    return `proxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
  use:
    - sub

- name: auto
  use:
    - sub
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true
    
proxy-providers:
  sub:
    type: http
    url: "${url}"
    path: ./proxy_providers/sub.yml
    health-check:
      enable: true
      url: http://cp.cloudflare.com/generate_204
      interval: 300
      timeout: 5000
      lazy: true
      expected-status: 204`;
}

// Настройка кнопок скачивания и копирования (вынесено в отдельную функцию)
function setupDownloadAndCopy(config) {
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    downloadBtn.classList.remove('hidden');
    downloadBtn.onclick = function() {
        downloadConfig(config);
    };
    
    copyBtn.onclick = function() {
        copyToClipboard(config);
    };
}

function parseHysteria2Uri(line) {
    // Исправляем регулярное выражение для корректного парсинга
    const match = line.match(/(?:hysteria2|hy2):\/\/([^@]+)@([^:]+):(\d+)(?:\/?\?([^#]*))?(?:#(.*))?/);
    if (!match) {
        throw new Error('Invalid Hysteria2 URI format');
    }

    const [_, password, server, portStr, paramsStr = "", name = ""] = match;
    const port = parseInt(portStr, 10);
    const decodedName = decodeURIComponent(name).trim() || `Hysteria2 ${server}:${port}`;

    const proxy = {
        type: "hysteria2",
        name: decodedName,
        server: server,
        port: port,
        password: decodeURIComponent(password),
        sni: undefined,
        obfs: undefined,
        "obfs-password": undefined,
        "skip-cert-verify": false,
        fingerprint: undefined,
        tfo: false
    };

    // Парсинг параметров
    const params = new URLSearchParams(paramsStr);
    
    // Обработка obfs и obfs-password
    if (params.has('obfs')) {
        proxy.obfs = params.get('obfs');
        if (proxy.obfs === 'none') {
            proxy.obfs = undefined;
        } else if (params.has('obfs-password')) {
            proxy["obfs-password"] = params.get('obfs-password');
        }
    }

    // Остальные параметры
    proxy.sni = params.get('sni') || params.get('peer');
    proxy["skip-cert-verify"] = params.has('insecure') && /(TRUE)|1/i.test(params.get('insecure'));
    proxy.fingerprint = params.get('fp') || params.get('fingerprint') || params.get('pinSHA256');
    proxy.tfo = params.has('tfo') && /(TRUE)|1/i.test(params.get('tfo'));

    return proxy;
}
// Функция для парсинга VLESS URI с поддержкой Reality и Fingerprint
function parseVlessUri(line) {
    line = line.split('vless://')[1];
    let isShadowrocket;
    let parsed = /^(.*?)@(.*?):(\d+)\/?(\?(.*?))?(?:#(.*?))?$/.exec(line);
    if (!parsed) {
        let [_, base64, other] = /^(.*?)(\?.*?$)/.exec(line);
        line = `${atob(base64)}${other}`;
        parsed = /^(.*?)@(.*?):(\d+)\/?(\?(.*?))?(?:#(.*?))?$/.exec(line);
        isShadowrocket = true;
    }
    let [__, uuid, server, portStr, ___, addons = "", name] = parsed;
    if (isShadowrocket) {
        uuid = uuid.replace(/^.*?:/g, "");
    }

    const port = parseInt(portStr, 10);
    uuid = decodeURIComponent(uuid);
    name = decodeURIComponent(name || '').trim();

    const proxy = {
        type: "vless",
        name: name || `VLESS ${server}:${port}`,
        server,
        port,
        uuid,
        tls: false,
        network: "tcp",
        alpn: [],
        "ws-opts": {},
        "http-opts": {},
        "grpc-opts": {},
        "reality-opts": {},
        "client-fingerprint": undefined,
        sni: undefined
    };

    const params = {};
    if (addons) {
        for (const addon of addons.split('&')) {
            const [key, valueRaw] = addon.split('=');
            const value = decodeURIComponent(valueRaw || '');
            params[key] = value;
        }
    }

    // Обработка параметров безопасности
    proxy.tls = (params.security && params.security !== 'none') || undefined;
    if (isShadowrocket && /TRUE|1/i.test(params.tls)) {
        proxy.tls = true;
        params.security = params.security || "reality";
    }
    
    proxy.sni = params.sni || params.peer;
    proxy.flow = params.flow ? 'xtls-rprx-vision' : undefined;
    proxy['skip-cert-verify'] = /(TRUE)|1/i.test(params.allowInsecure || '');
    proxy['client-fingerprint'] = params.fp;

    // Обработка ALPN
    if (params.alpn) {
        const alpnStr = params.alpn.replace(/%2F/g, '/');
        proxy.alpn = alpnStr.split(',');
    }

    // Обработка Reality параметров
    if (params.security === "reality") {
        if (params.pbk) {
            proxy['reality-opts']['public-key'] = params.pbk;
        }
        if (params.sid) {
            proxy['reality-opts']['short-id'] = params.sid;
        }
    }

    // Определение типа сети
    proxy.network = params.type || 'tcp';
    if (!['tcp', 'ws', 'http', 'grpc', 'h2'].includes(proxy.network)) {
        proxy.network = 'tcp';
    }

    // Обработка параметров для каждого типа подключения
    switch (proxy.network) {
        case 'ws':
            proxy['ws-opts'] = {
                headers: {}
            };
            
            // Добавляем path только если он указан
            if (params.path) {
                proxy['ws-opts'].path = decodeURIComponent(params.path);
            }
            
            // Обработка host/headers
            if (params.host || params.obfsParam) {
                const host = params.host || params.obfsParam;
                try {
                    const parsedHeaders = JSON.parse(host);
                    if (Object.keys(parsedHeaders).length > 0) {
                        proxy['ws-opts'].headers = parsedHeaders;
                    }
                } catch (e) {
                    if (host) {
                        proxy['ws-opts'].headers.Host = host;
                    }
                }
            }
            
            // Обработка дополнительных заголовков (только если есть значение)
            if (params.eh && params.eh.includes(':')) {
                const [headerName, headerValue] = params.eh.split(':').map(s => s.trim());
                if (headerName && headerValue) {
                    proxy['ws-opts'].headers[headerName] = headerValue;
                }
            }
            break;
            
        case 'grpc':
            proxy['grpc-opts'] = {};
            if (params.serviceName) {
                proxy['grpc-opts']['grpc-service-name'] = decodeURIComponent(params.serviceName);
            }
            break;
            
        case 'http':
            proxy['http-opts'] = {
                headers: {}
            };
            
            if (params.path) {
                proxy['http-opts'].path = decodeURIComponent(params.path);
            }
            
            if (params.host || params.obfsParam) {
                const host = params.host || params.obfsParam;
                try {
                    proxy['http-opts'].headers = JSON.parse(host);
                } catch (e) {
                    if (host) {
                        proxy['http-opts'].headers.Host = host;
                    }
                }
            }
            break;
    }

    // Удаляем пустые объекты opts
    ['ws-opts', 'http-opts', 'grpc-opts'].forEach(opt => {
        if (Object.keys(proxy[opt]).length === 0) {
            proxy[opt] = {};
        }
    });

    return proxy;
}

function parseVmessUri(line) {
    line = line.split('vmess://')[1];
    let content = atob(line);
    let params;
    
    try {
        params = JSON.parse(content);
    } catch (e) {
        // Shadowrocket формат
        const match = /(^[^?]+?)\/?\?(.*)$/.exec(line);
        if (match) {
            let [_, base64Line, qs] = match;
            content = atob(base64Line);
            params = {};
            
            for (const addon of qs.split('&')) {
                const [key, valueRaw] = addon.split('=');
                const value = decodeURIComponent(valueRaw);
                params[key] = value;
            }
            
            const contentMatch = /(^[^:]+?):([^:]+?)@(.*):(\d+)$/.exec(content);
            if (contentMatch) {
                let [__, cipher, uuid, server, port] = contentMatch;
                params.scy = cipher;
                params.id = uuid;
                params.port = port;
                params.add = server;
            }
        } else {
            throw new Error('Неверный формат VMess ссылки');
        }
    }
    
    const server = params.add || params.address || params.host;
    const port = parseInt(params.port, 10);
    const name = params.ps || params.remarks || params.remark || `VMess ${server}:${port}`;
    
    const proxy = {
        type: "vmess",
        name: name,
        server: server,
        port: port,
        uuid: params.id,
        alterId: parseInt(params.aid || params.alterId || 0, 10),
        cipher: params.scy || "auto",
        tls: params.tls === "tls" || params.tls === "1" || params.tls === 1,
        "skip-cert-verify": params.allowInsecure === "1" || params.allowInsecure === "true",
        network: params.net || "tcp",
        "ws-opts": {},
        "http-opts": {},
        "grpc-opts": {}
    };
    
    if (params.sni) {
        proxy.servername = params.sni;
    }
    
    // Обработка типа сети
    if (proxy.network === "ws") {
        proxy["ws-opts"] = {
            path: params.path || "/",
            headers: {}
        };
        
        if (params.host) {
            try {
                const headers = JSON.parse(params.host);
                proxy["ws-opts"].headers = headers;
            } catch (e) {
                proxy["ws-opts"].headers.Host = params.host;
            }
        }
    } else if (proxy.network === "http") {
        proxy["http-opts"] = {
            path: params.path ? [params.path] : ["/"],
            headers: {
                Host: params.host ? [params.host] : []
            }
        };
    } else if (proxy.network === "grpc") {
        proxy["grpc-opts"] = {
            "grpc-service-name": params.path || ""
        };
    }
    
    return proxy;
}

function parseShadowsocksUri(line) {
    line = line.split('ss://')[1];
    let [userinfo, serverInfo] = line.split('@');
    let [server, port] = serverInfo.split(':');
    port = parseInt(port, 10);
    
    // Декодируем userinfo (может быть в base64)
    try {
        userinfo = atob(userinfo);
    } catch (e) {
        // Если не base64, оставляем как есть
    }
    
    let [method, password] = userinfo.split(':');
    const name = decodeURIComponent(line.split('#')[1] || `Shadowsocks ${server}:${port}`);
    
    const proxy = {
        type: "ss",
        name: name,
        server: server,
        port: port,
        cipher: method,
        password: password
    };
    
    // Обработка параметров плагина (если есть)
    if (line.includes('?plugin=')) {
        const pluginStr = decodeURIComponent(line.split('?plugin=')[1].split('#')[0]);
        const pluginParts = pluginStr.split(';');
        
        if (pluginParts[0].includes('obfs')) {
            proxy.plugin = "obfs";
            proxy["plugin-opts"] = {
                mode: pluginParts.find(p => p.startsWith('obfs='))?.split('=')[1] || "http",
                host: pluginParts.find(p => p.startsWith('obfs-host='))?.split('=')[1] || ""
            };
        } else if (pluginParts[0].includes('v2ray-plugin')) {
            proxy.plugin = "v2ray-plugin";
            proxy["plugin-opts"] = {
                mode: "websocket",
                host: pluginParts.find(p => p.startsWith('host='))?.split('=')[1] || "",
                path: pluginParts.find(p => p.startsWith('path='))?.split('=')[1] || "/",
                tls: pluginParts.includes('tls')
            };
        }
    }
    
    return proxy;
}


function parseTrojanUri(line) {
    line = line.split('trojan://')[1];
    let [userinfo, serverInfo] = line.split('@');
    let [server, portAndParams] = serverInfo.split(':');
    let [port, params] = portAndParams.split('?');
    port = parseInt(port, 10);
    
    const password = decodeURIComponent(userinfo);
    const name = decodeURIComponent(params?.split('#')[1] || `Trojan ${server}:${port}`);
    
    const proxy = {
        type: "trojan",
        name: name,
        server: server,
        port: port,
        password: password,
        "skip-cert-verify": false,
        sni: "",
        alpn: [],
        network: "tcp",
        "grpc-opts": {},
        "ws-opts": {}
    };
    
    // Обработка параметров
    if (params) {
        const paramsStr = params.split('#')[0];
        for (const param of paramsStr.split('&')) {
            const [key, value] = param.split('=');
            const decodedValue = decodeURIComponent(value || '');
            
            switch (key) {
                case 'allowInsecure':
                case 'allow_insecure':
                    proxy["skip-cert-verify"] = decodedValue === '1' || decodedValue === 'true';
                    break;
                case 'sni':
                case 'peer':
                    proxy.sni = decodedValue;
                    break;
                case 'type':
                    proxy.network = decodedValue;
                    break;
                case 'host':
                    if (proxy.network === 'ws') {
                        proxy["ws-opts"] = proxy["ws-opts"] || {};
                        proxy["ws-opts"].headers = proxy["ws-opts"].headers || {};
                        proxy["ws-opts"].headers.Host = decodedValue;
                    }
                    break;
                case 'path':
                    if (proxy.network === 'ws') {
                        proxy["ws-opts"] = proxy["ws-opts"] || {};
                        proxy["ws-opts"].path = decodedValue;
                    }
                    break;
                case 'alpn':
                    proxy.alpn = decodedValue.split(',');
                    break;
                case 'fp':
                case 'fingerprint':
                    proxy["client-fingerprint"] = decodedValue;
                    break;
            }
        }
    }
    
    return proxy;
}

function generateHysteria2Config(proxy) {
    let config = `proxies:
  - name: "${proxy.name.replace(/'/g, "''")}"
    type: ${proxy.type}
    server: '${proxy.server}'
    port: ${proxy.port}
    password: '${proxy.password}'`;

    // Обязательные параметры
    if (proxy.sni) {
        config += `
    sni: '${proxy.sni}'`;
    }

    // Обязательно добавляем obfs и obfs-password, если они есть
    if (proxy.obfs) {
        config += `
    obfs: '${proxy.obfs}'`;
        if (proxy["obfs-password"]) {
            config += `
    obfs-password: '${proxy["obfs-password"]}'`;
        }
    }

    // Остальные параметры
    config += `
    skip-cert-verify: ${proxy["skip-cert-verify"] || false}
    tfo: ${proxy.tfo || false}`;

    if (proxy.fingerprint) {
        config += `
    fingerprint: '${proxy.fingerprint}'`;
    }

    // Добавляем proxy-groups
    config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

    return config;
}

function generateVmessConfig(proxy) {
    let config = `proxies:
  - name: "${proxy.name.replace(/'/g, "''")}"
    type: ${proxy.type}
    server: '${proxy.server}'
    port: ${proxy.port}
    uuid: '${proxy.uuid}'
    alterId: ${proxy.alterId || 0}
    cipher: '${proxy.cipher || "auto"}'`;

    if (proxy.tls) {
        config += `
    tls: true`;
    }
    if (proxy.servername) {
        config += `
    servername: '${proxy.servername}'`;
    }
    if (proxy["skip-cert-verify"] !== undefined) {
        config += `
    skip-cert-verify: ${proxy["skip-cert-verify"]}`;
    }
    if (proxy.network) {
        config += `
    network: '${proxy.network}'`;
    }

    if (proxy.network === 'ws' && proxy["ws-opts"]) {
        config += `
    ws-opts:`;
        if (proxy["ws-opts"].path) {
            config += `
      path: '${proxy["ws-opts"].path}'`;
        }
        if (proxy["ws-opts"].headers && Object.keys(proxy["ws-opts"].headers).length > 0) {
            config += `
      headers:`;
            for (const [key, value] of Object.entries(proxy["ws-opts"].headers)) {
                config += `
        ${key}: '${value}'`;
            }
        }
    } else if (proxy.network === 'grpc' && proxy["grpc-opts"]) {
        config += `
    grpc-opts:
      grpc-service-name: '${proxy["grpc-opts"]["grpc-service-name"] || ""}'`;
    }

    config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

    return config;
}

function generateShadowsocksConfig(proxy) {
    let config = `proxies:
  - name: "${proxy.name.replace(/'/g, "''")}"
    type: ${proxy.type}
    server: '${proxy.server}'
    port: ${proxy.port}
    cipher: '${proxy.cipher}'
    password: '${proxy.password}'`;

    if (proxy.plugin) {
        config += `
    plugin: '${proxy.plugin}'`;
        if (proxy["plugin-opts"]) {
            config += `
    plugin-opts:`;
            for (const [key, value] of Object.entries(proxy["plugin-opts"])) {
                if (typeof value === 'string') {
                    config += `
      ${key}: '${value}'`;
                } else if (typeof value === 'boolean') {
                    config += `
      ${key}: ${value}`;
                }
            }
        }
    }

    // Добавляем proxy-groups
config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

    return config;
}

function generateTrojanConfig(proxy) {
    let config = `proxies:
  - name: "${proxy.name.replace(/'/g, "''")}"
    type: ${proxy.type}
    server: '${proxy.server}'
    port: ${proxy.port}
    password: '${proxy.password}'`;

    if (proxy.tls !== false) {
        config += `
    tls: true`;
    }
    if (proxy.sni) {
        config += `
    servername: '${proxy.sni}'`;
    }
    if (proxy["skip-cert-verify"] !== undefined) {
        config += `
    skip-cert-verify: ${proxy["skip-cert-verify"]}`;
    }
    if (proxy["client-fingerprint"]) {
        config += `
    client-fingerprint: '${proxy["client-fingerprint"]}'`;
    }
    if (proxy.alpn && proxy.alpn.length > 0) {
        config += `
    alpn:`;
        proxy.alpn.forEach(a => {
            config += `
      - '${a}'`;
        });
    }
    if (proxy.network && proxy.network !== 'tcp') {
        config += `
    network: '${proxy.network}'`;
    }

    // Опции для разных типов сети
    if (proxy.network === 'ws' && proxy["ws-opts"]) {
        config += `
    ws-opts:`;
        if (proxy["ws-opts"].path) {
            config += `
      path: '${proxy["ws-opts"].path}'`;
        }
        if (proxy["ws-opts"].headers && Object.keys(proxy["ws-opts"].headers).length > 0) {
            config += `
      headers:`;
            for (const [key, value] of Object.entries(proxy["ws-opts"].headers)) {
                config += `
        ${key}: '${value}'`;
            }
        }
    } else if (proxy.network === 'grpc' && proxy["grpc-opts"]) {
        config += `
    grpc-opts:
      grpc-service-name: '${proxy["grpc-opts"]["grpc-service-name"] || ""}'`;
    }

    // Добавляем proxy-groups
config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

    return config;
}

function generateVlessConfig(proxy) {
    let config = `proxies:
  - name: "${proxy.name.replace(/'/g, "''")}"
    type: ${proxy.type}
    server: '${proxy.server}'
    port: ${proxy.port}
    uuid: '${proxy.uuid}'`;

    if (proxy.tls) {
        config += `
    tls: true`;
    }
    if (proxy.sni) {
        config += `
    servername: '${proxy.sni}'`;
    }
    if (proxy.flow) {
        config += `
    flow: '${proxy.flow}'`;
    }
    if (proxy['skip-cert-verify'] !== undefined) {
        config += `
    skip-cert-verify: ${proxy['skip-cert-verify']}`;
    }
    if (proxy['client-fingerprint']) {
        config += `
    client-fingerprint: '${proxy['client-fingerprint']}'`;
    }
    if (proxy.alpn && proxy.alpn.length > 0) {
        config += `
    alpn:`;
        proxy.alpn.forEach(a => {
            config += `
      - '${a}'`;
        });
    }
    if (proxy.network) {
        config += `
    network: '${proxy.network}'`;
    }

    // Reality параметры
    if (proxy['reality-opts'] && (proxy['reality-opts']['public-key'] || proxy['reality-opts']['short-id'])) {
        config += `
    reality-opts:`;
        if (proxy['reality-opts']['public-key']) {
            config += `
      public-key: '${proxy['reality-opts']['public-key']}'`;
        }
        if (proxy['reality-opts']['short-id']) {
            config += `
      short-id: '${proxy['reality-opts']['short-id']}'`;
        }
    }
    config += `
    ws-opts:`;
    if (Object.keys(proxy['ws-opts']).length > 0) {
        if (proxy['ws-opts'].headers) {
            config += `
      headers:`;
            for (const [key, value] of Object.entries(proxy['ws-opts'].headers)) {
                config += `
        ${key}: '${value}'`;
            }
        }
        if (proxy['ws-opts'].path) {
            config += `
      path: '${proxy['ws-opts'].path}'`;
        }
    } else {
        config += ` {}`;
    }

    if (proxy.network === 'grpc' && proxy['grpc-opts'] && proxy['grpc-opts']['grpc-service-name']) {
        config += `
    grpc-opts:
      grpc-service-name: '${proxy['grpc-opts']['grpc-service-name']}'`;
    } else {
        config += `
    grpc-opts: {}`;
    }
    config += `
    http-opts: {}`;

    // Добавляем proxy-groups без лишних отступов
    config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

    return config;
}

// Генерация конфига для нескольких прокси
function generateMultiProxyConfig(proxies) {
    let config = 'proxies:';
    
    // Добавляем все прокси
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        let proxyConfig;
        switch (proxy.type) {
            case 'vless':
                proxyConfig = generateVlessConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'vmess':
                proxyConfig = generateVmessConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'ss':
                proxyConfig = generateShadowsocksConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'trojan':
                proxyConfig = generateTrojanConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'hysteria2':
                proxyConfig = generateHysteria2Config(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
        }
        
        // Убираем только одну лишнюю пустую строку в конце
        proxyConfig = proxyConfig.replace(/\n+$/, '');
        
        // Добавляем с правильным отступом
        config += (i === 0 ? '' : '\n') + proxyConfig;
    }

    // Собираем все имена прокси для групп
    const proxyNames = proxies.map(p => p.name.replace(/'/g, "''"));
    
    // Добавляем proxy-groups с правильным форматированием
    config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    ${proxyNames.map(name => `- "${name}"`).join('\n    ')}

- name: auto
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true
  proxies:
    ${proxyNames.map(name => `- "${name}"`).join('\n    ')}`;

    return config;
}

function downloadConfig(config) {
    const blob = new Blob([config], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clash-config.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Визуальная обратная связь
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Скопировано!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}
document.querySelector('button[onclick="convert()"]').addEventListener('click', convert);
