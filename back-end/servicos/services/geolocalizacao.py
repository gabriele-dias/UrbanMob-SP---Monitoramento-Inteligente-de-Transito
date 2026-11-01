REGIOES = [
    {
        "nome": "Centro",
        "latitude": -23.550520,
        "longitude": -46.633308,
        "intensidade": "Alto",
        "velocidade_media": 18,
    },
    {
        "nome": "Zona Sul",
        "latitude": -23.650000,
        "longitude": -46.700000,
        "intensidade": "Moderado",
        "velocidade_media": 28,
    },
    {
        "nome": "Zona Norte",
        "latitude": -23.480000,
        "longitude": -46.620000,
        "intensidade": "Leve",
        "velocidade_media": 42,
    },
    {
        "nome": "Zona Leste",
        "latitude": -23.550000,
        "longitude": -46.480000,
        "intensidade": "Moderado",
        "velocidade_media": 31,
    },
    {
        "nome": "Zona Oeste",
        "latitude": -23.560000,
        "longitude": -46.720000,
        "intensidade": "Leve",
        "velocidade_media": 39,
    },
]


def listar_regioes():
    return [dict(regiao) for regiao in REGIOES]


def obter_regiao(nome):
    nome_normalizado = " ".join(nome.strip().casefold().split())
    return next(
        (
            dict(regiao)
            for regiao in REGIOES
            if " ".join(regiao["nome"].casefold().split()) == nome_normalizado
        ),
        None,
    )
