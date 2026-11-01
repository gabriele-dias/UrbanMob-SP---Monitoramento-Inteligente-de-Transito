import requests
from configuracao import Config

def obter_dados_trafego():
    origem = "-23.550520,-46.633308"
    destino = "-23.548943,-46.638818"

    url = "https://maps.googleapis.com/maps/api/directions/json"

    params = {
        "origin": origem,
        "destination": destino,
        "departure_time": "now",
        "key": Config.GOOGLE_API_KEY
    }

    resposta = requests.get(url, params=params, timeout=5)

    dados = resposta.json()

    print("RESPOSTA GOOGLE:")
    print(dados)

    if not dados.get("routes"):
        return {
            "erro": "Nenhuma rota encontrada",
            "resposta_google": dados
        }

    rota = dados["routes"][0]["legs"][0]

    tempo_normal = rota["duration"]["value"]
    tempo_transito = rota["duration_in_traffic"]["value"]

    return {
        "tempo_normal_min": round(tempo_normal / 60, 1),
        "tempo_transito_min": round(tempo_transito / 60, 1)
    }
