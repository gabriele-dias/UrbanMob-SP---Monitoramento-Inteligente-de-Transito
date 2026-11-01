def obter_configuracao_mapa():
    return {
        "provedor": "nativo",
        "provedores_por_plataforma": {
            "android": "Google Maps",
            "ios": "Apple Maps",
        },
        "tiles_externos": False,
        "legenda": [
            {"intensidade": "Leve", "cor": "#2E9D50"},
            {"intensidade": "Moderado", "cor": "#E6A700"},
            {"intensidade": "Alto", "cor": "#D93636"},
        ],
    }
