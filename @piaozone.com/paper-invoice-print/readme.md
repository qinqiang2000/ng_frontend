
# 完整的静态页面代码

```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>test</title>
        <style>
            .printIframe {
                width: 0;
                height: 0;
                position: absolute;
            }
        </style>
    </head>
    <body>
        <button onclick="printTest()">打印</button>
        <iframe id="printIframeId" class="printIframe"></iframe>
        <!-- 通过script标签引入, 注意需要相关的pollyfile，可以使用gallery公共的pollyfile文件 -->
        <!-- paperInvoicePrint.min.js 测试环境地址https://img-sit.piaozone.com/static/public/js/paperInvoicePrint.min.js -->
        <!-- paperInvoicePrint.min.js 正式环境地址https://img.piaozone.com/static/public/js/paperInvoicePrint.min.js -->
        <script src="../dist/paperInvoicePrint.min.js"></script>
        <script>
            function printTest() {
                const paperPrint = new PaperInvoicePrint({
                    printIframeId: 'printIframeId',
                    // 该方法需要返回errcode，description，data这些信息，可直接使用：数电纸质发票打印信息的获取这个接口返回的数据格式。
                    queryPrintInfo: function(info) {
                        if (info.invoiceNo === '09217066') {
                            return {
                                errcode: '0000',
                                data: {
                                    dataType: 1,
                                    XMLKey: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iZ2JrIj8-PGJ1c2luZXNzIGlkPSI5MzAxMCIgY29tbWVudD0i5Y-R56Wo5omT5Y2wIj48Ym9keSB5eWx4ZG09IjEiPjxmcGx4ZG0-MzI8L2ZwbHhkbT48ZHlmcz4wPC9keWZzPjxrcHh4PjxmcGRtPjAxMjAwMjEwMDEwNTwvZnBkbT48ZnBobT4wOTIxNzA2NjwvZnBobT48c2Z3eXhianRkeXM-PC9zZnd5eGJqdGR5cz48ZnB6dD4wMDwvZnB6dD48a3Bmcz4wMDwva3Bmcz48a3BycT4yMDI0MTAxNDwva3BycT48anFiaD48L2pxYmg-PHNrbT7mlbDnlLXnpajlj7fnoIHvvJoyNDEyMjAwMDAwMDA2MzI0NTAwOeWFqOWbveWinuWAvOeojuWPkeelqOafpemqjOW5s-WPsO-8mmh0dHBzOi8vaW52LXZlcmkuY2hpbmF0YXguZ292LmNuLzwvc2ttPjxqeW0-MjQxMjIwMDAwMDAwNjMyNDUwMDk8L2p5bT48dHNwej48L3RzcHo-PHpzZnM-MDwvenNmcz48emhzbD48L3poc2w-PHhoZHdzYmg-OTExMjAxMDU3MzAzNzMyOFhOPC94aGR3c2JoPjx4aGR3bWM-5aSp5rSl55m-5rSL5Yy76I2v5pyJ6ZmQ5YWs5Y-4PC94aGR3bWM-PHhoZHdkemRoPuWkqea0peW4guays-WMl-WMuuWFieWkjemBk-ihl-a1t-ays-S4nOi3r-S4jueLruWtkOael-Wkp-ihl-S6pOWPo-aXuua1t-WbvemZheW5v-WcuuWGmeWtl-alvDLlj7fmpbwzMOWxgjMwMDQwMjItMjYyNzc5Nzg8L3hoZHdkemRoPjx4aGR3eWh6aD7kuK3lm73pk7booYzogqHku73mnInpmZDlhazlj7jlpKnmtKXmsrPljJfmlK_ooYwyNzY1NzcyMTk2Mzc8L3hoZHd5aHpoPjxnaGR3c2JoPjEyMTIwMDAwNDAxMzU0MzI4SjwvZ2hkd3NiaD48Z2hkd21jPuWkqea0peW4guiCv-eYpOWMu-mZojwvZ2hkd21jPjxnaGR3ZHpkaD7lpKnmtKXluILmsrPopb_ljLrkvZPpmaLljJfnjq_muZbopb_ot68wMjI8L2doZHdkemRoPjxnaGR3eWh6aD7kuK3lm73lu7rorr7pk7booYzogqHku73mnInpmZDlhazlj7jlpKnmtKXmsrPopb_mlK_ooYwxMjAwMTYzNTQwMDA1MjUwMzI2MjwvZ2hkd3loemg-PGZ5eG0gY291bnQ9IjMiPjxncm91cCB4aD0iMSI-PGZwaHh6PjA8L2ZwaHh6PjxzcG1jPirljJblraboja_lk4HliLbliYIq5rCv5YyW6ZK-5rOo5bCE5rayPC9zcG1jPjxzcHNtPjwvc3BzbT48Z2d4aD4xMG1sOjEuMGc8L2dneGg-PGR3PuaUrzwvZHc-PHNwc2w-MjE2MDwvc3BzbD48ZGo-MS4wNjE5NDkwNzwvZGo-PGplPjIyOTMuODE8L2plPjxoc2J6PjwvaHNiej48c3BibT4xMDcwMzAyMDMwMDAwMDAwMDAwPC9zcGJtPjxzbD4wLjEzPC9zbD48c2U-Mjk4LjE5PC9zZT48enhibT48L3p4Ym0-PHloemNicz48L3loemNicz48bHNsYnM-PC9sc2xicz48enpzdHNnbD48L3p6c3RzZ2w-PC9ncm91cD48Z3JvdXAgeGg9IjIiPjxmcGh4ej4wPC9mcGh4ej48c3BtYz4q5YyW5a2m6I2v5ZOB5Yi25YmCKua1k-awr-WMlumSoOazqOWwhOa2sjwvc3BtYz48c3BzbT48L3Nwc20-PGdneGg-MTBtbDoxZyo15pSvPC9nZ3hoPjxkdz7nm5I8L2R3PjxzcHNsPjYwMDwvc3BzbD48ZGo-Mi42NTQ4NjY2NzwvZGo-PGplPjE1OTIuOTI8L2plPjxoc2J6PjwvaHNiej48c3BibT4xMDcwMzAyMDMwMDAwMDAwMDAwPC9zcGJtPjxzbD4wLjEzPC9zbD48c2U-MjA3LjA4PC9zZT48enhibT48L3p4Ym0-PHloemNicz48L3loemNicz48bHNsYnM-PC9sc2xicz48enpzdHNnbD48L3p6c3RzZ2w-PC9ncm91cD48Z3JvdXAgeGg9IjMiPjxmcGh4ej4wPC9mcGh4ej48c3BtYz4q5YyW5a2m6I2v5ZOB5Yi25YmCKuiRoeiQhOezluazqOWwhOa2sjwvc3BtYz48c3BzbT48L3Nwc20-PGdneGg-MjBtbO-8mjEwZzwvZ2d4aD48ZHc-5pSvPC9kdz48c3BzbD42MDAwPC9zcHNsPjxkaj4xPC9kaj48amU-NjAwMC4wMDwvamU-PGhzYno-PC9oc2J6PjxzcGJtPjEwNzAzMDIwMzAwMDAwMDAwMDA8L3NwYm0-PHNsPjAuMTM8L3NsPjxzZT43ODAuMDA8L3NlPjx6eGJtPjwvenhibT48eWh6Y2JzPjwveWh6Y2JzPjxsc2xicz48L2xzbGJzPjx6enN0c2dsPjwvenpzdHNnbD48L2dyb3VwPjwvZnl4bT48aGpqZT45ODg2LjczPC9oamplPjxoanNlPjEyODUuMjc8L2hqc2U-PGpzaGo-MTExNzIuMDA8L2pzaGo-PGJ6PuWQq-eojuS7t--8miAxLjIwIDMuMDAgMS4xMzwvYno-PHNrcj48L3Nrcj48ZmhyPjwvZmhyPjxrcHI-5q615Zac5rOiPC9rcHI-PHlmcGRtPjwveWZwZG0-PHlmcGhtPjwveWZwaG0-PC9rcHh4PjwvYm9keT48L2J1c2luZXNzPg',
                                    printType: '0', // 发票传0，清单传1
                                    invoiceCategory: '02', // 发票传02，清单传xhqd, 机动车销售统一发票传03，二手车销售统一发票
                                }
                            };
                        } else if (info.invoiceNo === '00044878') {
                            return {
                                errcode: '0000',
                                data: {
                                    dataType: 1,
                                    XMLKey: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iZ2JrIj8-PGJ1c2luZXNzIGlkPSI5MzAxMCIgY29tbWVudD0i5Y-R56Wo5omT5Y2wIj48Ym9keSB5eWx4ZG09IjEiPjxmcGx4ZG0-MzM8L2ZwbHhkbT48ZHlmcz4wPC9keWZzPjxrcHh4PjxmcGRtPjEyMTAyMjMyMTA3MTwvZnBkbT48ZnBobT4wMDA0NDg3ODwvZnBobT48c2Z3eXhianRkeXM-PC9zZnd5eGJqdGR5cz48ZnB6dD4wMDwvZnB6dD48a3BycT4yMDI0MTAxNTwva3BycT48anFiaD48L2pxYmg-PHNrbT7mlbDnlLXnpajlj7fnoIHvvJoyNDkxMjAwMDAwMDAyNDc5OTUzOeWFqOWbveWinuWAvOeojuWPkeelqOafpemqjOW5s-WPsO-8mmh0dHBzOi8vaW52LXZlcmkuY2hpbmF0YXguZ292LmNuLzwvc2ttPjxnaGZtYz7prY_mvpw8L2doZm1jPjxzZnpobT48L3NmemhtPjxnaGZzYmg-MjIwMTA0MTk5NjA4MDQzODJYPC9naGZzYmg-PHNjcXltYz7kuIDmsb0t5aSn5LyX5rG96L2m5pyJ6ZmQ5YWs5Y-4PC9zY3F5bWM-PGNsbHg-6L2_6L2mPC9jbGx4PjxjcHhoPuWlpei_queJjC9BVURJRlY3MTQ4TEFERUc8L2NweGg-PGNkPumdkuWym-W4gjwvY2Q-PGhnemg-V0FCMDUyNDY3NTEzMzYyPC9oZ3poPjxqa3ptc2g-PC9qa3ptc2g-PHNqZGg-PC9zamRoPjxmZGpobT5OOTI3Njc8L2ZkamhtPjxjamhtPkxGVjJCMjhZNlI2NTEzMzYyPC9jamhtPjxqc2hqPjEzNTAwMC4wMDwvanNoaj48eGhkd21jPuWkp-i_nuijlei_quaxvei9pumUgOWUruacjeWKoeaciemZkOWFrOWPuDwveGhkd21jPjx4aGR3c2JoPjkxMjEwMjAwNjc0MDYzMTIwTjwveGhkd3NiaD48ZGg-Mzk2ODY2NjY8L2RoPjx6aD4yOTM0NTc4Nzc5ODE8L3poPjxkej7ovr3lroHnnIHlpKfov57luILnlJjkupXlrZDljLrombnln47ot681NTDlj7c8L2R6PjxraHloPuS4reWbvemTtuihjOiCoeS7veaciemZkOWFrOWPuOWkp-i_nuaymeays-WPo-aUr-ihjDwva2h5aD48enpzc2w-MC4xMzwvenpzc2w-PHp6c3NlPjE1NTMwLjk3PC96enNzZT48c3dqZ2RtPjEyMTAyMTEwMzAwPC9zd2pnZG0-PHN3amdtYz7lm73lrrbnqI7liqHmgLvlsYDlpKfov57luILnlJjkupXlrZDljLrnqI7liqHlsYDovpvlr6jlrZDnqI7liqHmiYA8L3N3amdtYz48Ymhzaj4xMTk0NjkuMDM8L2Joc2o-PHdzcHpobT48L3dzcHpobT48ZHc-PC9kdz48eGNycz41PC94Y3JzPjxsc2xicz48L2xzbGJzPjxiej7kuIDovabkuIDnpag8L2J6PjxrcHI-6JSh5pyIPC9rcHI-PHB5YnM-MTwvcHlicz48L2tweHg-PC9ib2R5PjwvYnVzaW5lc3M-',
                                    printType: '0', // 发票传0，清单传1
                                    invoiceCategory: '03', // 发票传02，清单传xhqd, 机动车销售统一发票传03，二手车销售统一发票
                                }
                            };
                        } else if (info.invoiceNo === '00095960') {
                            return {
                                errcode: '0000',
                                data: {
                                    dataType: 1,
                                    XMLKey: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iZ2JrIj8-PGJ1c2luZXNzIGlkPSI5MzAxMCIgY29tbWVudD0i5Y-R56Wo5omT5Y2wIj48Ym9keSB5eWx4ZG09IjEiPjxmcGx4ZG0-MzQ8L2ZwbHhkbT48ZHlmcz4wPC9keWZzPjxrcHh4PjxmcGRtPjAyMTAyMjQwMDExNzwvZnBkbT48ZnBobT4wMDA5NTk2MDwvZnBobT48c2Z3eXhianRkeXM-PC9zZnd5eGJqdGR5cz48ZnB6dD4wMDwvZnB6dD48a3BycT4yMDI0MTAxNTwva3BycT48anFiaD48L2pxYmg-PHNrbT7mlbDnlLXnpajlj7fnoIHvvJoyNDkxMjAwMDAwMDAyNDgyMjcxNuWFqOWbveWinuWAvOeojuWPkeelqOafpemqjOW5s-WPsO-8mmh0dHBzOi8vaW52LXZlcmkuY2hpbmF0YXguZ292LmNuLzwvc2ttPjxnZm1jPuWkp-i_nuW8oOWFiOeUn-S6jOaJi-i9pui0uOaYk-aciemZkOWFrOWPuDwvZ2ZtYz48Z2ZkbT45MTIxMDIxM01BRDFVS0tHODA8L2dmZG0-PGdmZHo-6L695a6B55yB5aSn6L-e57uP5rWO5oqA5pyv5byA5Y-R5Yy65Lic5Z-O5ZutOeagiy0xLTExLTLlj7c8L2dmZHo-PGdmZGg-MTM5NDExNjUxNTA8L2dmZGg-PHhmbWM-5aSn6L-e6KOV6L-q5rG96L2m6ZSA5ZSu5pyN5Yqh5pyJ6ZmQ5YWs5Y-4PC94Zm1jPjx4ZmRtPjkxMjEwMjAwNjc0MDYzMTIwTjwveGZkbT48eGZkej7ovr3lroHnnIHlpKfov57luILnlJjkupXlrZDljLrombnln47ot681NTDlj7c8L3hmZHo-PHhmZGg-Mzk2ODY2NjY8L3hmZGg-PGNwemg-6L69Qlk3MFM0PC9jcHpoPjxkanpoPjIxMDAwODI5NDYxNTwvZGp6aD48Y2xseD7lsI_lnovovb_ovaY8L2NsbHg-PGNsc2JoPkxGVjJBMkJTNUY0MDM1MDkzPC9jbHNiaD48Y3B4aD7lpKfkvJfniYxGVjcxNjBCQkJHRzwvY3B4aD48enJkY2xnbHNtYz7lpKfov57luILovabnrqHmiYA8L3pyZGNsZ2xzbWM-PGp5cG1kd21jPuWkp-i_nuijlei_quaxvei9pumUgOWUruacjeWKoeaciemZkOWFrOWPuDwvanlwbWR3bWM-PGp5cG1kd2R6Pui-veWugeecgeWkp-i_nuW4gueUmOS6leWtkOWMuuiZueWfjui3rzU1MOWPtzwvanlwbWR3ZHo-PGp5cG1kd3NiaD45MTIxMDIwMDY3NDA2MzEyME48L2p5cG1kd3NiaD48anlwbWR3eWh6aD7kuK3lm73pk7booYzogqHku73mnInpmZDlhazlj7jlpKfov57mspnmsrPlj6PmlK_ooYwyOTM0NTc4Nzc5ODE8L2p5cG1kd3loemg-PGp5cG1kd2RoPjM5Njg2NjY2PC9qeXBtZHdkaD48ZXNjc2NtYz48L2VzY3NjbWM-PGVzY3Njc2JoPjwvZXNjc2NzYmg-PGVzY3NjZHo-PC9lc2NzY2R6Pjxlc2NzY3loemg-PC9lc2NzY3loemg-PGVzY3NjZGg-PC9lc2NzY2RoPjxjamhqPjIwMDAwLjAwPC9jamhqPjxoanNlPjA8L2hqc2U-PGtwcj7mnajkuL3lqJw8L2twcj48Yno-PC9iej48ZnhramJ6PjA8L2Z4a2piej48L2tweHg-PC9ib2R5PjwvYnVzaW5lc3M-',
                                    printType: '0', // 发票传0，清单传1
                                    invoiceCategory: '04', // 发票传02，清单传xhqd, 机动车销售统一发票传03，二手车销售统一发票
                                }
                            };
                        }
                    },
                    stepFinish: function(info, res) {
                        console.log('单步打印结果', info, res);
                    },
                    printFinish: function(res) {
                        console.log('打印结束返回', res);
                        if (res.errcode !== '0000') {
                            alert(res.description);
                        }
                    }
                });
                // 这里的参数传给queryPrintInfo方法，通过后台获取打印的完整信息
                paperPrint.start([{
                    invoiceCode: '021022400117',
                    invoiceNo: '09217066',
                    etaxInvoiceNo: '24912000000024822716'
                }]);
            }
        </script>
    </body>
    </html>
```