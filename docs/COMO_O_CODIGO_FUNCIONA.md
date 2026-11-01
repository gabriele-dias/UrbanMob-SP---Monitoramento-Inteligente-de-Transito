# Como o código do UrbanMob SP funciona

Este guia acompanha uma solicitação desde o toque na tela do celular até a resposta da API. Ele também explica o papel dos principais arquivos para que você consiga navegar pelo projeto e fazer alterações com segurança.

## 1. Visão geral

O sistema tem duas aplicações que trabalham juntas:

```text
Aplicativo React Native no celular
        │
        │ HTTP + JSON (Axios)
        ▼
API Flask no computador ou servidor
        │
        ├── Serviços Python com dados demonstrativos
        └── Nominatim para pesquisar endereços
```

O mapa é exibido usando o provedor nativo do `react-native-maps` (Google Maps no Android e Apple Maps no iOS). O app não baixa tiles de um servidor público externo, evitando bloqueios HTTP 403. Nesta versão, os indicadores de trânsito são demonstrativos, não dados reais em tempo real.

## 2. Como o aplicativo começa

O ponto de entrada do Expo é `mobile/App.js`. Ele importa `mobile/src/App.js`, que monta as partes compartilhadas do aplicativo:

1. `PaperProvider` disponibiliza o tema e os componentes visuais do React Native Paper.
2. `MapContextProvider` mantém o resultado da busca de endereço disponível entre telas.
3. `NavigationContainer` ativa a navegação entre telas.
4. O navegador de pilha abre as abas principais e a tela de detalhes de uma região.

As abas Dashboard, Mapa e Regiões são definidas em `mobile/src/navigation/MainTabs.js`. Os nomes usados para navegar ficam em `mobile/src/navigation/navigators.js`.

## 3. O que acontece quando uma tela pede dados

As telas não montam URLs nem tratam diretamente os detalhes de Axios. O fluxo comum é:

1. A tela chama uma função de `mobile/src/services/api.js`.
2. Essa função usa a instância Axios configurada com a URL base e timeout.
3. Axios envia uma requisição HTTP para o Flask.
4. A tela recebe os dados em JSON e os mostra em componentes.

A URL da API é lida da variável `EXPO_PUBLIC_API_URL`. Por exemplo, no celular em rede local, ela aponta para `http://IP-DO-COMPUTADOR:5000`. O endereço `localhost` é adequado para um simulador no computador, mas no celular apontaria para o próprio telefone.

O hook `mobile/src/hooks/useApiData.js` centraliza o estado de uma consulta:

- `loading`: a requisição está em andamento;
- `data`: resultado recebido;
- `error`: mensagem quando a consulta falha;
- `refresh`: função para repetir a consulta.

As telas usam esses estados para mostrar carregamento, conteúdo ou uma mensagem de erro com opção para tentar novamente. O hook **não** atualiza automaticamente em intervalos; a atualização acontece ao carregar a tela ou quando a pessoa toca para tentar novamente.

## 4. Como cada tela funciona

### Dashboard

`mobile/src/screens/DashboardScreen.js` chama `getTraffic()`, que consulta `GET /traffic`. A tela apresenta o congestionamento geral, a velocidade média, a região crítica, a quantidade de regiões e o horário da atualização.

Os valores e a data vêm do backend. A hora é formatada para a localidade do aparelho (`pt-BR`). O botão “Atualizar dados” chama `refresh()` do hook.

### Regiões e detalhes

`mobile/src/screens/RegionsScreen.js` pede a lista a `getRegions()`, que consulta `GET /regioes`. Para cada item, cria um `RegionCard` com nome, velocidade e intensidade.

Ao tocar no cartão, a navegação abre `RegionDashboardScreen` e passa a região selecionada como parâmetro. A tela de detalhes consulta `GET /traffic/<nome>` para buscar os indicadores daquela região.

### Mapa e pesquisa

`mobile/src/screens/MapScreen.js` carrega as regiões e desenha um `Marker` para cada uma usando latitude, longitude e intensidade recebidas da API. `trafficColor()` em `mobile/src/styles/theme.js` converte a intensidade em cor; `TrafficLegend` explica as cores.

O componente `AddressSearch` recebe o texto digitado e chama a função de pesquisa da tela. A sequência é:

1. A tela chama `searchAddress(endereco)`.
2. Axios consulta `GET /buscar?endereco=...`.
3. Se a busca funcionar, a tela guarda o resultado em `MapContext`.
4. `animateToRegion()` move a câmera para latitude e longitude encontradas.
5. Um marcador adicional destaca o endereço pesquisado.

O fundo do mapa é fornecido pela plataforma nativa. A atribuição é exibida pelo próprio Google Maps ou Apple Maps. A busca de endereço ainda depende do serviço público Nominatim, que tem políticas e limites de uso; consulte a documentação do provedor antes de publicar para muitas pessoas.

## 5. Como a API Flask processa a solicitação

O ponto de inicialização é `back-end/servicos/app.py`. `create_app()` cria a aplicação Flask, registra o Blueprint de rotas e define respostas JSON para erros HTTP ou inesperados. Ao executar `python app.py`, o servidor escuta na porta `5000`.

`back-end/servicos/rotas.py` liga caminhos HTTP a operações. Uma rota geralmente:

1. recebe os parâmetros da URL;
2. valida o que é obrigatório;
3. chama uma função em `back-end/servicos/services/`;
4. transforma o resultado em JSON;
5. escolhe o status HTTP apropriado.

Os serviços separam responsabilidades da seguinte forma:

- `services/traffic.py`: monta as métricas agregadas e por região;
- `services/geolocalizacao.py`: guarda e consulta a lista demonstrativa de regiões;
- `services/busca.py`: consulta o geocodificador Nominatim, com timeout e tratamento de falha;
- `services/mapa.py`: informa a configuração do mapa, atribuição e legenda.

O serviço Nominatim retorna um nome e coordenadas. Se o endereço não existir, a API responde 404. Se o parâmetro estiver vazio ou longo demais, responde 400. Se o serviço externo falhar, responde 502. As rotas retornam JSON mesmo nos erros.

## 6. Endpoints usados pelo aplicativo

| Tela ou recurso | Requisição | Resultado |
|---|---|---|
| Indicadores gerais | `GET /traffic` | Métricas do Dashboard |
| Lista e marcadores do mapa | `GET /regioes` | Nome, coordenadas, intensidade e velocidade |
| Detalhes da região | `GET /traffic/<nome>` | Métricas de uma região |
| Busca no mapa | `GET /buscar?endereco=<texto>` | Nome e coordenadas do endereço |
| Estado da API | `GET /status` | Verificação de disponibilidade |
| Configuração do mapa | `GET /mapa` | Provedor nativo por plataforma e legenda |

Exemplo de resposta para uma pesquisa:

```json
{
  "nome": "Avenida Paulista, São Paulo, Brasil",
  "latitude": -23.561684,
  "longitude": -46.655981
}
```

## 7. Onde fazer alterações comuns

- **Mudar cores e tema:** `mobile/src/styles/theme.js`.
- **Mudar o cartão de métrica:** `mobile/src/components/MetricCard.js`.
- **Mudar campos do Dashboard:** `mobile/src/screens/DashboardScreen.js`.
- **Mudar o comportamento do mapa ou marcadores:** `mobile/src/screens/MapScreen.js`.
- **Mudar uma região demonstrativa:** `back-end/servicos/services/geolocalizacao.py`.
- **Mudar os cálculos de trânsito:** `back-end/servicos/services/traffic.py`.
- **Criar ou alterar um endpoint:** `back-end/servicos/rotas.py`; deixe a lógica de negócio no serviço correspondente.
- **Alterar o endereço da API no app:** defina `EXPO_PUBLIC_API_URL` antes de iniciar o Expo.

Depois de modificar arquivos do app, o Expo normalmente recompila e atualiza o cliente de desenvolvimento. Depois de modificar o backend, salve o arquivo; se o servidor não reiniciar sozinho, pare-o com `Ctrl+C` e inicie-o novamente.

## 8. O que ainda não é automático ou real

- As métricas de trânsito são exemplos calculados a partir de dados locais demonstrativos.
- A pesquisa de endereço depende de acesso à internet e do serviço Nominatim.
- O aplicativo não recebe eventos de trânsito em tempo real. Um passo futuro é atualizar por polling controlado ou integrar WebSocket/SSE quando houver uma fonte de eventos.
- Em desenvolvimento, os servidores Flask e Expo precisam continuar rodando no computador. Para distribuir o aplicativo sem depender do PC, será necessário hospedar a API e gerar uma versão instalável de produção.

## 9. Depuração rápida

Se uma tela não carregar:

1. Confirme se a API está ativa abrindo `http://IP-DO-PC:5000/status` no navegador do celular.
2. Confirme que `EXPO_PUBLIC_API_URL` aponta para o mesmo IP e que o Expo foi iniciado depois de definir a variável.
3. Verifique a mensagem no terminal do backend e no terminal do Expo.
4. Para conferir um endpoint isoladamente, abra-o no navegador ou use `curl`, por exemplo `http://IP-DO-PC:5000/regioes`.
5. Se o Expo Go mostrar erro de SDK, atualize o Expo Go e use um QR code criado pelo servidor Expo atual.

Para instruções de instalação, configuração da rede e inicialização passo a passo, consulte o [guia de instalação no README](../README.md#instalação-e-execução-no-celular-windows).
