from flask import Blueprint, current_app, jsonify, request

from services.busca import GeocodingError, buscar_endereco
from services.geolocalizacao import listar_regioes, obter_regiao
from services.mapa import obter_configuracao_mapa
from services.traffic import obter_dados_trafego, obter_trafego_regiao

api = Blueprint("api", __name__)


@api.get("/")
def home():
    return jsonify({"api": "UrbanMob SP", "versao": "1.0.0", "status": "online"})


@api.get("/status")
def status():
    return jsonify({"status": "online"})


@api.get("/traffic")
def traffic():
    return jsonify(obter_dados_trafego())


@api.get("/traffic/<nome>")
def traffic_regiao(nome):
    dados = obter_trafego_regiao(nome)
    if dados is None:
        return jsonify({"erro": "Região não encontrada"}), 404
    return jsonify(dados)


@api.get("/regioes")
def regioes():
    return jsonify(listar_regioes())


@api.get("/regioes/<nome>")
def regiao(nome):
    dados = obter_regiao(nome)
    if dados is None:
        return jsonify({"erro": "Região não encontrada"}), 404
    return jsonify(dados)


@api.get("/buscar")
def busca():
    endereco = request.args.get("endereco", "").strip()
    if not endereco:
        return jsonify({"erro": "Informe o parâmetro endereco"}), 400
    if len(endereco) > 200:
        return jsonify({"erro": "O endereço deve ter no máximo 200 caracteres"}), 400

    try:
        resultado = buscar_endereco(endereco)
    except GeocodingError:
        current_app.logger.exception("Falha ao consultar o serviço de geocodificação")
        return jsonify({"erro": "Serviço de busca indisponível"}), 502

    if resultado is None:
        return jsonify({"erro": "Endereço não encontrado"}), 404
    return jsonify(resultado)


@api.get("/mapa")
def mapa():
    return jsonify(obter_configuracao_mapa())
