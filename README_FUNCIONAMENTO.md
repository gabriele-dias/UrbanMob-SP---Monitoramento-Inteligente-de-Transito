# UrbanMob SP — funcionamento passo a passo

Este documento explica o que acontece dentro do UrbanMob SP quando a API e o aplicativo são iniciados e quando alguém usa cada tela. Para instalar as ferramentas e executar o projeto pela primeira vez, consulte o [README principal](README.md).

## 1. Visão geral do sistema

O UrbanMob SP tem duas partes:

```text
Aplicativo React Native (celular)
        │
        │ HTTP: pedidos e respostas JSON
        ▼
API Flask (computador durante o desenvolvimento)
        │
        ├── Serviços Python com dados demonstrativos de trânsito
        └── Nominatim para procurar endereços
```

O app e a API são processos separados. O celular apresenta as telas e solicita dados; o Flask recebe as solicitações, executa a operação correspondente e devolve JSON. Durante o desenvolvimento, os dois precisam estar ativos e acessíveis pela mesma rede.

## 2. Inicialização do backend

1. O comando `python app.py`, executado dentro de `back-end/servicos`, inicia o servidor Flask.
2. `app.py` chama `create_app()`, cria a aplicação e registra o conjunto de rotas definido em `rotas.py`.
3. O servidor escuta na porta `5000`, disponível para o computador e, na rede local, para o celular.
4. Uma solicitação para `/status` retorna `{"status":"online"}`. Isso confirma que o servidor responde, mas não consulta uma fonte de trânsito real.

O arquivo `rotas.py` recebe os pedidos HTTP. A lógica de cada recurso fica separada em `back-end/servicos/services/`, evitando que toda a regra de negócio fique misturada à camada HTTP.

## 3. Inicialização do aplicativo

1. O Expo inicia o projeto e disponibiliza o JavaScript para o Expo Go.
2. `mobile/App.js` carrega `mobile/src/App.js`.
3. `PaperProvider` configura os componentes e o tema visual.
4. `MapContextProvider` cria um estado compartilhado para o endereço pesquisado.
5. `NavigationContainer` configura as telas e os caminhos de navegação.
6. `MainTabs.js` apresenta as abas Dashboard, Mapa e Regiões. O navegador também registra a tela de detalhes de região.

Antes de iniciar o Expo, o endereço da API deve estar definido em `EXPO_PUBLIC_API_URL`. Em um telefone, use o endereço IP do computador na rede, por exemplo `http://192.168.15.2:5000`; `localhost` no telefone apontaria para o próprio telefone.

## 4. Como uma chamada à API funciona

Quando uma tela precisa de dados:

1. A tela chama uma função em `mobile/src/services/api.js`.
2. A função usa Axios, configurado com a URL base e um limite de espera de oito segundos.
3. Axios envia um pedido HTTP ao endereço e endpoint correspondentes.
4. Flask procura a rota em `rotas.py`.
5. A rota valida os parâmetros e chama uma função de serviço.
6. O serviço devolve dados Python; Flask os transforma em JSON.
7. O app recebe a resposta e atualiza o conteúdo da tela.

O hook `mobile/src/hooks/useApiData.js` mantém os estados `loading`, `data` e `error`, além da função `refresh` para repetir uma consulta. Assim, a tela pode mostrar carregamento, conteúdo ou uma mensagem de falha. Os dados não são atualizados continuamente: a tela carrega ao ser aberta e pode ser atualizada pelo botão disponível.

## 5. Fluxo do Dashboard

1. A pessoa abre a aba **Dashboard**.
2. `DashboardScreen.js` chama `getTraffic()`.
3. Axios faz `GET /traffic`.
4. A rota Flask chama `obter_dados_trafego()` em `services/traffic.py`.
5. O serviço consulta a lista demonstrativa de regiões, calcula a velocidade média e escolhe a região com menor velocidade como a mais crítica.
6. A API devolve congestionamento, velocidade média, região crítica, quantidade de regiões e timestamp.
7. A tela exibe cada valor em um `MetricCard`.
8. “Atualizar dados” chama `refresh()` e faz a consulta novamente.

Os indicadores desta versão são simulados e não representam o trânsito atual da cidade.

## 6. Fluxo da lista e dos detalhes das regiões

1. Ao abrir **Regiões**, `RegionsScreen.js` chama `getRegions()`.
2. Axios faz `GET /regioes`.
3. `services/geolocalizacao.py` fornece a lista configurada: Centro, Zona Sul, Zona Norte, Zona Leste e Zona Oeste.
4. Cada item contém nome, coordenadas, intensidade e velocidade média.
5. A tela cria um `RegionCard` por item.
6. Ao tocar em um cartão, o app navega para `RegionDashboardScreen` e passa o nome da região.
7. A tela de detalhes chama `getRegionTraffic(nome)`, que consulta `GET /traffic/<nome>`.
8. Flask retorna as métricas regionais; se não encontrar a região, retorna HTTP 404 com uma mensagem JSON.

## 7. Fluxo do mapa

1. Ao abrir **Mapa**, `MapScreen.js` busca as regiões com `getRegions()`.
2. O componente `MapView` apresenta o mapa nativo da plataforma: Google Maps no Android e Apple Maps no iOS.
3. Para cada região recebida, o app desenha um `Marker` nas coordenadas correspondentes.
4. `trafficColor()` transforma a intensidade em cor: verde para leve, amarelo para moderado e vermelho para alto.
5. Ao tocar no marcador, o mapa mostra o nome da região, sua intensidade e a velocidade média.
6. A legenda `TrafficLegend` explica as cores.

O mapa nativo não depende dos tiles públicos que estavam retornando HTTP 403. O mapa de fundo é carregado pelo serviço da própria plataforma; os marcadores e indicadores de trânsito são fornecidos pelo UrbanMob SP.

## 8. Fluxo da pesquisa de endereço

1. A pessoa digita um endereço no componente `AddressSearch` e toca em **Buscar**.
2. `MapScreen.js` chama `searchAddress(endereco)`.
3. Axios envia `GET /buscar?endereco=<texto>` à API Flask.
4. A rota valida que o endereço não esteja vazio e não passe de 200 caracteres.
5. `services/busca.py` consulta o Nominatim com limite de espera e identifica o aplicativo no pedido.
6. Se encontrar o endereço, o backend responde com nome, latitude e longitude.
7. O app guarda o resultado em `MapContext`, move a câmera para as coordenadas e desenha outro marcador.

Se o endereço estiver vazio ou longo demais, a API responde HTTP 400. Se não houver resultado, responde HTTP 404. Se o Nominatim estiver indisponível, responde HTTP 502. A tela mostra a mensagem de erro em vez de tratar a pesquisa como bem-sucedida.

## 9. Endpoints e serviços

| Endpoint | O que faz |
|---|---|
| `GET /` | Informa o nome e o estado da API. |
| `GET /status` | Verifica se a API está respondendo. |
| `GET /traffic` | Retorna métricas gerais demonstrativas. |
| `GET /traffic/<regiao>` | Retorna as métricas de uma região. |
| `GET /regioes` | Lista regiões, coordenadas e indicadores. |
| `GET /regioes/<nome>` | Consulta os dados cadastrais de uma região. |
| `GET /buscar?endereco=<texto>` | Procura endereço e retorna coordenadas. |
| `GET /mapa` | Informa a configuração nativa do mapa e a legenda. |

O código está organizado por responsabilidade:

- `mobile/src/screens/`: telas.
- `mobile/src/components/`: elementos visuais reaproveitáveis.
- `mobile/src/navigation/`: abas e navegação entre telas.
- `mobile/src/services/api.js`: pedidos HTTP do app.
- `mobile/src/hooks/`: estados reutilizáveis de carregamento de dados.
- `mobile/src/contexts/`: estado compartilhado, como o endereço pesquisado.
- `back-end/servicos/app.py`: criação e inicialização do Flask.
- `back-end/servicos/rotas.py`: endpoints e validação HTTP.
- `back-end/servicos/services/`: regras, regiões, mapa e integração de geocodificação.

## 10. O que continua rodando e o que é real

No desenvolvimento local, mantenha dois processos ativos: o Flask na porta `5000` e o Expo/Metro na porta `8081`. O Expo Go carrega o app pelo Metro; o app consulta a API Flask. O computador precisa continuar ligado, e celular e computador precisam conseguir se comunicar pela rede.

O mapa de fundo usa o provedor nativo, e a pesquisa de endereço consulta o Nominatim pela API. As métricas de trânsito são simuladas; ainda não há integração com sensores, provedores de tráfego ou atualizações em tempo real. Para uso por clientes sem depender do computador de desenvolvimento, a API precisa ser hospedada em um servidor e o app precisa ser distribuído como uma versão de produção.

## 11. Referências

- [Instalação e execução do app](README.md#instalação-e-execução-no-celular-windows)
- [Guia técnico dos arquivos e responsabilidades](docs/COMO_O_CODIGO_FUNCIONA.md)
