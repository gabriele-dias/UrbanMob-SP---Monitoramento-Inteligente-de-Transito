from datetime import datetime, timezone

from services.geolocalizacao import listar_regioes, obter_regiao


def obter_dados_trafego():
    regioes = listar_regioes()
    regiao_critica = min(regioes, key=lambda regiao: regiao["velocidade_media"])
    velocidade_media = round(
        sum(regiao["velocidade_media"] for regiao in regioes) / len(regioes)
    )
    intensidade_geral = regiao_critica["intensidade"]

    return {
        "cidade": "São Paulo",
        "congestionamento": intensidade_geral,
        "velocidade_media": velocidade_media,
        "regiao_critica": regiao_critica["nome"],
        "regioes_monitoradas": len(regioes),
        "ultima_atualizacao": datetime.now(timezone.utc).isoformat(),
    }


def obter_trafego_regiao(nome):
    regiao = obter_regiao(nome)
    if regiao is None:
        return None

    return {
        "cidade": "São Paulo",
        "regiao": regiao["nome"],
        "congestionamento": regiao["intensidade"],
        "intensidade": regiao["intensidade"],
        "velocidade_media": regiao["velocidade_media"],
        "latitude": regiao["latitude"],
        "longitude": regiao["longitude"],
        "ultima_atualizacao": datetime.now(timezone.utc).isoformat(),
    }
