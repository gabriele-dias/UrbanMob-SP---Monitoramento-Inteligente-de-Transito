# UrbanMob SP

Aplicativo mobile para consulta de trânsito e mobilidade urbana em São Paulo. O repositório contém o cliente React Native e uma API REST Flask; nesta primeira versão, os indicadores de trânsito são dados demonstrativos e a busca de endereços usa o serviço público Nominatim.

## Arquitetura

Para acompanhar passo a passo como a tela se comunica com a API e descobrir onde alterar cada funcionalidade, consulte o [guia de funcionamento do código](docs/COMO_O_CODIGO_FUNCIONA.md).

```text
┌─────────────────────────────┐       HTTPS / JSON       ┌─────────────────────────┐
│ Celular                     │ ───────────────────────► │ API Flask               │
│ React Native + Navigation   │ ◄─────────────────────── │ rotas → serviços        │
│ Paper + Axios + mapa OSM    │                           └────────────┬────────────┘
└─────────────────────────────┘                                        │
                                                              HTTP com timeout
                                                                       ▼
                                                         Nominatim (geocodificação)
```

O mapa é renderizado pelo provedor nativo da plataforma (Google Maps no Android e Apple Maps no iOS), sem baixar tiles de servidores públicos. O backend não retransmite imagens de mapa. Os serviços Flask isolam as regras de trânsito, os dados das regiões, a geocodificação e a configuração do mapa; rotas apenas validam parâmetros, chamam serviços e serializam respostas. A API stateless pode ser escalada horizontalmente. Uma integração futura de trânsito real pode substituir os dados simulados sem alterar os contratos consumidos pelo app.

### Fluxo de uma consulta

1. A tela ou hook chama a camada `services/api.js`.
2. Axios envia uma requisição REST para a URL configurada no dispositivo.
3. Uma rota Flask encaminha a operação ao serviço correspondente.
4. O serviço consulta dados demonstrativos ou uma fonte externa com timeout.
5. A API responde com JSON e status HTTP adequado; o cliente apresenta estado de carregamento, erro ou dados.

Atualizações futuras: começar com polling controlado e `updated_at`; quando houver uma fonte de eventos persistente, acrescentar SSE/WebSocket em uma camada separada, sem acoplar o mapa à conexão.

## Estrutura do repositório

```text
.
├── mobile/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── assets/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── navigation/
│       ├── screens/
│       ├── services/
│       └── styles/
├── back-end/
│   └── servicos/
│       ├── app.py
│       ├── rotas.py
│       ├── configuracao.py
│       ├── services/
│       │   ├── traffic.py
│       │   ├── geolocalizacao.py
│       │   ├── mapa.py
│       │   └── busca.py
│       ├── tests/
│       ├── requirements.txt
│       └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Responsabilidades mobile

- `screens/`: Dashboard, mapa, lista de regiões e detalhes regionais.
- `components/`: cartões de métricas, legenda, busca, marcadores e estados vazios/erro.
- `navigation/`: navegação por abas e pilha de detalhes.
- `services/`: cliente Axios e operações tipadas por recurso.
- `hooks/`: carregamento e atualização dos dados.
- `contexts/`: estado compartilhado de localização/região selecionada.
- `assets/`: imagens e recursos visuais.
- `styles/`: tema, cores de intensidade e espaçamentos.

### Responsabilidades backend

- `app.py`: fábrica da aplicação e tratamento de erros.
- `rotas.py`: contrato HTTP, validação de entrada e status codes.
- `services/traffic.py`: métricas gerais e por região (mock nesta versão).
- `services/geolocalizacao.py`: catálogo de regiões.
- `services/busca.py`: geocodificação via Nominatim.
- `services/mapa.py`: configuração e legenda do mapa.
- `configuracao.py`: variáveis de ambiente e limites de integração.

## Telas e navegação

```text
Abas: Dashboard | Mapa | Regiões
                         └── selecionar região → Dashboard da Região
Mapa: campo de endereço → buscar coordenadas → mover câmera → marcador do resultado
```

O Dashboard exibe congestionamento, velocidade média, região crítica, regiões monitoradas e horário da atualização. O Mapa apresenta o mapa nativo da plataforma, marcadores com cores verde/amarelo/vermelho e detalhes ao tocar. Regiões lista Centro, Zona Sul, Zona Norte, Zona Leste e Zona Oeste. A busca está integrada ao Mapa; uma busca bem-sucedida centraliza a câmera e mostra o endereço encontrado.

## Contrato REST

Base local: `http://<host>:5000`. Todas as respostas usam JSON.

| Método e caminho | Sucesso | Descrição |
|---|---:|---|
| `GET /` | 200 | Nome e versão da API |
| `GET /status` | 200 | Saúde da aplicação |
| `GET /traffic` | 200 | Métricas agregadas da cidade |
| `GET /traffic/<regiao>` | 200 / 404 | Métricas para a região |
| `GET /regioes` | 200 | Regiões e intensidade atual |
| `GET /regioes/<nome>` | 200 / 404 | Detalhes e métricas da região |
| `GET /buscar?endereco=<texto>` | 200 / 400 / 404 / 502 | Geocodificação do endereço |
| `GET /mapa` | 200 | Provedor nativo por plataforma e legenda |

Exemplo `GET /traffic`:

```json
{
  "cidade": "São Paulo",
  "congestionamento": "Alto",
  "velocidade_media": 22,
  "regiao_critica": "Centro",
  "regioes_monitoradas": 5,
  "ultima_atualizacao": "2026-11-01T14:20:00Z"
}
```

Exemplo `GET /regioes`:

```json
[
  {
    "nome": "Centro",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "intensidade": "Alto",
    "velocidade_media": 18
  }
]
```

Exemplo `GET /buscar?endereco=avenida%20paulista`:

```json
{
  "nome": "Avenida Paulista, São Paulo, Região Imediata de São Paulo, Região Metropolitana de São Paulo, Região Geográfica Intermediária de São Paulo, São Paulo, Região Sudeste, Brasil",
  "latitude": -23.561684,
  "longitude": -46.655981
}
```

Erros usam `{"erro":"mensagem"}`. Busca sem parâmetro retorna 400, endereço sem resultado retorna 404 e indisponibilidade do geocodificador retorna 502.

## Instalação e execução no celular (Windows)

Este guia inicia o app no modo de desenvolvimento. O computador hospeda temporariamente a API Flask e o servidor Expo; mantenha-o ligado durante o uso. O celular não precisa de Python nem Node.js: instale apenas o Expo Go. Para usar o app sem depender do computador, publique a API em um servidor e gere/distribua um app de produção.

### Pré-requisitos

No computador:

- Windows 10/11 com acesso à internet.
- Python 3 instalado. O guia usa `py` no PowerShell para criar o ambiente virtual.
- Node.js instalado, incluindo o npm. O projeto foi atualizado para Expo SDK 58; use uma versão atual do Node.js LTS.
- Git Bash ou PowerShell. Os comandos principais abaixo são para PowerShell.

No celular Android:

- Expo Go instalado e atualizado pela Google Play Store.
- Celular e computador conectados à mesma rede Wi-Fi.

### 1. Instale e confira as ferramentas

Instale o Node.js LTS em [nodejs.org](https://nodejs.org/) e o Expo Go pela loja do celular. Depois da instalação do Node.js, feche e reabra o PowerShell (ou o VS Code) para atualizar o `PATH`.

No PowerShell:

```powershell
node -v
npm -v
py --version
```

Cada comando deve mostrar um número de versão. Se `node` ou `npm` não forem reconhecidos, confirme que o Node.js foi instalado e abra um terminal novo. Em uma instalação padrão do Windows, é possível verificar diretamente:

```powershell
& "C:\Program Files\nodejs\node.exe" -v
& "C:\Program Files\nodejs\npm.cmd" -v
```

### 2. Prepare o backend (uma vez)

Abra um PowerShell na pasta raiz do repositório, a pasta que contém `README.md`, e execute:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r back-end\servicos\requirements.txt
```

Se `.venv` já existir e estiver funcional, não precisa criá-lo novamente. Para iniciar a API, use um terminal PowerShell e deixe-o aberto:

```powershell
cd back-end\servicos
..\..\.venv\Scripts\python.exe app.py
```

A API deve informar que está rodando na porta `5000`. No navegador do computador, confira `http://localhost:5000/status`; a resposta esperada é `{"status":"online"}`.

### 3. Descubra o IP do computador

No PowerShell, execute:

```powershell
ipconfig
```

Anote o **Endereço IPv4** do adaptador Wi-Fi conectado à mesma rede do celular, por exemplo `192.168.15.2`. Não use `127.0.0.1` ou `localhost` no app do celular: esses endereços apontariam para o próprio telefone.

### 4. Instale as dependências do app (uma vez)

Abra **outro PowerShell** na raiz do repositório:

```powershell
cd mobile
npm ci
```

`npm ci` instala as versões registradas em `mobile/package-lock.json`. Se o arquivo de lock não estiver disponível, use `npm install`.

### 5. Inicie o Expo e conecte o celular

No mesmo PowerShell, ainda dentro de `mobile`, substitua o IP abaixo pelo IPv4 encontrado na etapa 3:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.15.2:5000"
npx expo start --lan --port 8081
```

Mantenha os dois terminais abertos: um com a API e outro com o Expo. O Expo mostrará um QR code. No celular, abra o Expo Go e escaneie o código. Se preferir informar o endereço manualmente, use `exp://<IP-DO-PC>:8081`, por exemplo `exp://192.168.15.2:8081`.

O cliente usa Expo SDK 58. Se o Expo Go informar incompatibilidade de SDK, atualize-o pela loja de aplicativos, feche-o completamente e tente ler o QR code atual novamente. Não reutilize QR code ou link de uma execução anterior.

### Git Bash

Se preferir Git Bash, execute a partir da raiz do repositório. As barras devem ser `/`, não `\`. Para criar o ambiente Python:

```bash
py -m venv .venv
./.venv/Scripts/python.exe -m pip install -r back-end/servicos/requirements.txt
```

Inicie a API em um terminal Git Bash:

```bash
cd back-end/servicos
../../.venv/Scripts/python.exe app.py
```

Em outro terminal, inicie o app. Se `node`/`npm` não forem reconhecidos após instalar Node.js e abrir um novo terminal, adicione a pasta padrão do Node ao `PATH` desta sessão:

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd mobile
npm ci
export EXPO_PUBLIC_API_URL=http://192.168.15.2:5000
npx expo start --lan --port 8081
```

Troque o endereço de exemplo pelo IPv4 do seu computador.

### Se o celular não conectar

1. Confirme que a API está acessível no celular, abrindo `http://<IP-DO-PC>:5000/status` no navegador do telefone. A resposta deve ser `{"status":"online"}`.
2. Confira se telefone e computador estão na mesma rede Wi-Fi. Algumas redes de convidados bloqueiam a comunicação entre dispositivos.
3. No Firewall do Windows, permita Python e Node.js na rede privada quando o Windows solicitar. Se a porta `5000` ou `8081` estiver bloqueada, permita-a na rede privada.
4. Reinicie o Expo e leia o QR code novo. O IP pode mudar ao reconectar à rede; nesse caso, atualize `EXPO_PUBLIC_API_URL` e reinicie o Expo.
5. Se o Metro informar que a porta `8081` já está em uso, encerre o Expo antigo com `Ctrl+C` no terminal dele antes de iniciar outro.

### Encerrar os servidores

No terminal do Expo e no terminal da API, pressione `Ctrl+C`. Para iniciar novamente, repita a etapa 2 para a API e a etapa 5 para o Expo; não é necessário reinstalar os pacotes.

### Emuladores

Para emuladores, configure `EXPO_PUBLIC_API_URL` para o host da API visto pelo emulador: Android Emulator normalmente usa `http://10.0.2.2:5000`; iOS Simulator usa `http://localhost:5000`. Para um telefone físico, use o IPv4 do computador.

### Docker Compose (API)

```powershell
docker compose up --build
```

Compose executa somente a API; o app mobile deve ser iniciado no ambiente Expo e acessar o endereço LAN do host.

## Mapa e integrações

O mapa usa o provedor nativo do `react-native-maps`: Google Maps no Android e Apple Maps no iOS. Isso remove as requisições a servidores públicos de tiles que estavam retornando HTTP 403. Busca de endereços ainda usa o serviço público Nominatim, sujeito a limites; a implementação o acessa somente após busca explícita, aplica timeout e identifica o User-Agent. Para uso em escala, configurar um provedor de geocodificação adequado, cache e limitação de requisições.

Os dados de trânsito são simulados e não representam condições atuais reais. Integrações futuras devem declarar fonte, timestamp, unidade e política de atualização, além de tratar indisponibilidade sem bloquear o dashboard.

## Testes

```powershell
cd back-end\servicos
python -m unittest discover -s tests -v
```
