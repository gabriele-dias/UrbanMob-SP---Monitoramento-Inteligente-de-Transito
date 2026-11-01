import unittest
from unittest.mock import patch

from app import create_app
from services.busca import GeocodingError


class UrbanMobApiTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_dashboard_returns_city_metrics(self):
        response = self.client.get("/traffic")

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["cidade"], "São Paulo")
        self.assertEqual(payload["regioes_monitoradas"], 5)
        self.assertIn("ultima_atualizacao", payload)

    def test_root_and_status_are_available(self):
        self.assertEqual(self.client.get("/").get_json()["api"], "UrbanMob SP")
        self.assertEqual(
            self.client.get("/status").get_json(),
            {"status": "online"},
        )

    def test_region_traffic_is_case_insensitive(self):
        response = self.client.get("/traffic/zOnA sUl")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["regiao"], "Zona Sul")

    def test_unknown_region_returns_json_not_found(self):
        response = self.client.get("/regioes/Regiao inexistente")

        self.assertEqual(response.status_code, 404)
        self.assertIn("erro", response.get_json())

    def test_regions_include_map_and_traffic_fields(self):
        response = self.client.get("/regioes")
        regions = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(regions), 5)
        self.assertTrue(
            all(
                {"latitude", "longitude", "intensidade", "velocidade_media"}
                <= region.keys()
                for region in regions
            )
        )

    def test_map_endpoint_uses_native_maps_without_external_tiles(self):
        response = self.client.get("/mapa")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["provedor"], "nativo")
        self.assertFalse(payload["tiles_externos"])
        self.assertEqual(
            payload["provedores_por_plataforma"]["android"],
            "Google Maps",
        )

    def test_search_requires_an_address(self):
        response = self.client.get("/buscar")

        self.assertEqual(response.status_code, 400)
        self.assertIn("erro", response.get_json())

    @patch("rotas.buscar_endereco", return_value=None)
    def test_search_reports_no_result(self, buscar_endereco_mock):
        response = self.client.get("/buscar?endereco=rua+inexistente")

        self.assertEqual(response.status_code, 404)
        buscar_endereco_mock.assert_called_once_with("rua inexistente")

    @patch(
        "rotas.buscar_endereco",
        return_value={"nome": "Avenida Paulista", "latitude": -23.56, "longitude": -46.65},
    )
    def test_search_returns_coordinates(self, buscar_endereco_mock):
        response = self.client.get("/buscar?endereco=avenida+paulista")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["nome"], "Avenida Paulista")
        self.assertIn("latitude", response.get_json())
        buscar_endereco_mock.assert_called_once_with("avenida paulista")

    @patch("rotas.buscar_endereco", side_effect=GeocodingError("upstream"))
    def test_search_reports_upstream_failure(self, buscar_endereco_mock):
        response = self.client.get("/buscar?endereco=avenida+paulista")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.get_json(), {"erro": "Serviço de busca indisponível"})


if __name__ == "__main__":
    unittest.main()
