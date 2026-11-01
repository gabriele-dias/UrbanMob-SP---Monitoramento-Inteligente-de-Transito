import requests

from configuracao import Config


class GeocodingError(Exception):
    pass


def buscar_endereco(endereco):
    try:
        response = requests.get(
            Config.NOMINATIM_URL,
            params={
                "q": endereco,
                "format": "jsonv2",
                "limit": 1,
                "countrycodes": "br",
                "accept-language": "pt-BR",
            },
            headers={"User-Agent": Config.NOMINATIM_USER_AGENT},
            timeout=Config.GEOCODING_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        resultados = response.json()
    except (requests.RequestException, ValueError) as error:
        raise GeocodingError("Serviço de busca indisponível") from error

    if not isinstance(resultados, list):
        raise GeocodingError("Resposta inválida do serviço de busca")
    if not resultados:
        return None

    resultado = resultados[0]
    try:
        return {
            "nome": resultado["display_name"],
            "latitude": float(resultado["lat"]),
            "longitude": float(resultado["lon"]),
        }
    except (KeyError, TypeError, ValueError) as error:
        raise GeocodingError("Resposta inválida do serviço de busca") from error
