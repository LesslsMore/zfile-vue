import Artplayer from 'artplayer';

// 加载 url danmu 播放器
function NewPlayer(src_url, container) {
    var art = new Artplayer({
        container,
        url: src_url,
        // autoplay: true,
        // muted: true,
        autoSize: true,
        fullscreen: true,
        fullscreenWeb: true,
        autoOrientation: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        setting: true,
        controls: [
            {
                position: 'right',
                html: '上传弹幕',
                click: function () {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "text/xml";
                    input.addEventListener("change", () => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            // console.log(reader)
                            const xml = reader.result;
                            // console.log(xml)
                            let dm = bilibiliDanmuParseFromXml(xml)
                            console.log(dm)
                            art.plugins.artplayerPluginDanmuku.config({
                                danmuku: dm,
                            });
                            art.plugins.artplayerPluginDanmuku.load();
                        };
                        reader.readAsText(input.files[0]);
                    });
                    input.click();
                },
            },
        ],
        contextmenu: [
            {
                name: '搜索',
                html: `<div id="k-player-danmaku-search-form">
                <label>
                  <span>搜索番剧名称</span>
                  <input type="text" id="animeName" class="k-input" />
                </label>
                <div style="min-height:24px; padding-top:4px">
                  <span id="tips"></span>
                </div>
                <label>
                  <span>番剧名称</span>
                  <select id="animes" class="k-select"></select>
                </label>
                <label>
                  <span>章节</span>
                  <select id="episodes" class="k-select"></select>
                </label>
                <label>
                  <span class="open-danmaku-list">
                    <span>弹幕列表</span><small id="count"></small>
                  </span>
                </label>

                <span class="specific-thanks">弹幕服务由 弹弹play 提供</span>
              </div>`,
            },
        ],
    });
    return art
}

function getMode(key) {
    switch (key) {
        case 1:
        case 2:
        case 3:
            return 0;
        case 4:
        case 5:
            return 1;
        default:
            return 0;
    }
}

// 将 danmu xml 字符串转为 bilibili 格式
function bilibiliDanmuParseFromXml(xmlString) {
    if (typeof xmlString !== 'string') return [];
    const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs);
    return Array.from(matches)
        .map((match) => {
            const attr = match.groups.p.split(',');
            if (attr.length >= 8) {
                const text = match.groups.text
                    .trim()
                    .replaceAll('&quot;', '"')
                    .replaceAll('&apos;', "'")
                    .replaceAll('&lt;', '<')
                    .replaceAll('&gt;', '>')
                    .replaceAll('&amp;', '&');

                return {
                    text,
                    time: Number(attr[0]),
                    mode: getMode(Number(attr[1])),
                    fontSize: Number(attr[2]),
                    color: `#${Number(attr[3]).toString(16)}`,
                    timestamp: Number(attr[4]),
                    pool: Number(attr[5]),
                    userID: attr[6],
                    rowID: Number(attr[7]),
                };
            } else {
                return null;
            }
        })
        .filter(Boolean);
}

// 将 danmu json 转为 bilibili 格式
function bilibiliDanmuParseFromJson(jsonString) {
    return jsonString.map((comment) => {
        let attr = comment.p.split(',');
        return {
            text: comment.m,
            time: Number(attr[0]),
            mode: getMode(Number(attr[1])),
            fontSize: Number(25),
            color: `#${Number(attr[2]).toString(16)}`,
            timestamp: Number(comment.cid),
            pool: Number(0),
            userID: attr[3],
            rowID: Number(0),
        }
    })
}

export { NewPlayer, bilibiliDanmuParseFromJson, bilibiliDanmuParseFromXml};
