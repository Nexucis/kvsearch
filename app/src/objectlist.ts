// MIT License
//
// Copyright (c) 2021 Augustin Husson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export const objectList = [
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:9093",
            "__meta_filepath": "/etc/prometheus/file_sd/alertmanager.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "env": "demo",
            "job": "alertmanager"
        },
        "labels": {
            "env": "demo",
            "instance": "demo.do.prometheus.io:9093",
            "job": "alertmanager"
        },
        "scrapePool": "alertmanager",
        "scrapeUrl": "http://demo.do.prometheus.io:9093/metrics",
        "globalUrl": "http://demo.do.prometheus.io:9093/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:04.339189435Z",
        "lastScrapeDuration": 0.005542168,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "http://localhost:9100",
            "__metrics_path__": "/probe",
            "__param_module": "http_2xx",
            "__scheme__": "http",
            "job": "blackbox"
        },
        "labels": {
            "instance": "http://localhost:9100",
            "job": "blackbox"
        },
        "scrapePool": "blackbox",
        "scrapeUrl": "http://127.0.0.1:9115/probe?module=http_2xx&target=http%3A%2F%2Flocalhost%3A9100",
        "globalUrl": "http://demo.do.prometheus.io:9115/probe?module=http_2xx&target=http%3A%2F%2Flocalhost%3A9100",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:08.286454952Z",
        "lastScrapeDuration": 0.003327111,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "localhost:2019",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "caddy"
        },
        "labels": {
            "instance": "localhost:2019",
            "job": "caddy"
        },
        "scrapePool": "caddy",
        "scrapeUrl": "http://localhost:2019/metrics",
        "globalUrl": "http://demo.do.prometheus.io:2019/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:04.141677673Z",
        "lastScrapeDuration": 0.058080259,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:3000",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "grafana"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:3000",
            "job": "grafana",
            "test": {
                "dummyTest": "yes"
            }
        },
        "scrapePool": "grafana",
        "scrapeUrl": "http://demo.do.prometheus.io:3000/metrics",
        "globalUrl": "http://demo.do.prometheus.io:3000/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:04.91770748Z",
        "lastScrapeDuration": 0.010871974,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:9100",
            "__meta_filepath": "/etc/prometheus/file_sd/node.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "env": "demo",
            "job": "node"
        },
        "labels": {
            "env": "demo",
            "instance": "demo.do.prometheus.io:9100",
            "job": "node"
        },
        "scrapePool": "node",
        "scrapeUrl": "http://demo.do.prometheus.io:9100/metrics",
        "globalUrl": "http://demo.do.prometheus.io:9100/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:13.433891894Z",
        "lastScrapeDuration": 0.108714478,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:9090",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "prometheus"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:9090",
            "job": "prometheus"
        },
        "scrapePool": "prometheus",
        "scrapeUrl": "http://demo.do.prometheus.io:9090/metrics",
        "globalUrl": "http://demo.do.prometheus.io:9090/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:07.157326369Z",
        "lastScrapeDuration": 0.012392002,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:8996",
            "__meta_filepath": "/etc/prometheus/file_sd/random.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "random"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:8996",
            "job": "random"
        },
        "scrapePool": "random",
        "scrapeUrl": "http://demo.do.prometheus.io:8996/metrics",
        "globalUrl": "http://demo.do.prometheus.io:8996/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:10.533513533Z",
        "lastScrapeDuration": 0.002940616,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:8999",
            "__meta_filepath": "/etc/prometheus/file_sd/random.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "random"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:8999",
            "job": "random"
        },
        "scrapePool": "random",
        "scrapeUrl": "http://demo.do.prometheus.io:8999/metrics",
        "globalUrl": "http://demo.do.prometheus.io:8999/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:15.079785104Z",
        "lastScrapeDuration": 0.003125844,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:8998",
            "__meta_filepath": "/etc/prometheus/file_sd/random.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "random"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:8998",
            "job": "random"
        },
        "scrapePool": "random",
        "scrapeUrl": "http://demo.do.prometheus.io:8998/metrics",
        "globalUrl": "http://demo.do.prometheus.io:8998/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:04.86344073Z",
        "lastScrapeDuration": 0.003958577,
        "health": "up"
    },
    {
        "discoveredLabels": {
            "__address__": "demo.do.prometheus.io:8997",
            "__meta_filepath": "/etc/prometheus/file_sd/random.yml",
            "__metrics_path__": "/metrics",
            "__scheme__": "http",
            "job": "random"
        },
        "labels": {
            "instance": "demo.do.prometheus.io:8997",
            "job": "random"
        },
        "scrapePool": "random",
        "scrapeUrl": "http://demo.do.prometheus.io:8997/metrics",
        "globalUrl": "http://demo.do.prometheus.io:8997/metrics",
        "lastError": "",
        "lastScrape": "2021-12-10T13:20:15.222302489Z",
        "lastScrapeDuration": 0.004778538,
        "health": "up"
    }
]
