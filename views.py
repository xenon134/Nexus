from aiohttp import web, WSMsgType
from backend import *

from pathlib import Path
website_root = Path('public').absolute()
async def file(request):
    return fileFromPath(website_root / request.path[1:], request.path)

def fileFromPath(path, requestPath):
    if path.is_dir():
        return fileFromPath(path / 'index.html', requestPath)
    if website_root not in path.absolute().parents:
        print('Refused:', requestPath)
        raise web.HTTPNotFound() # 404
    if path.is_file():
        print('Served:', requestPath)
        return web.FileResponse(path)
    else: # doesnt exist
        print('404:', requestPath)
        raise web.HTTPNotFound()

async def game(request):
    if Game.forcode(request.match_info['code']):
        return fileFromPath(website_root / "game", request.path)
    else:
        return web.FileResponse(website_root / 'badcode.html', status=404)

async def newgame(request):
    raise web.HTTPFound(location='game/' + Game.newgame())

activeConnections = list()
async def ws(request):
    print('Recieved Websocket request.')
    ws = web.WebSocketResponse()#heartbeat=10)
    await ws.prepare(request)

    activeConnections.append(ws)

    game = Game.forcode(await ws.receive_str())
    if game:
        await ws.send_str('ALLGOOD')
    else:
        await ws.send_str('BADCODE')
        await ws.close()

    async for msg in ws: # process messages as they come
        assert msg.type == WSMsgType.TEXT
        data = [int(i) for i in msg.data.split(',')]
        for i in activeConnections:
            if i is not ws:
                await i.send_str(msg.data)

        winningPoints = game.winningPoints(data)
        if winningPoints: # ws has won
            from json import dumps
            winningPoints = dumps(winningPoints)
            await ws.send_str('WIN:' + winningPoints)
            await ws.close()
            for j in activeConnections:
                if j is not ws:
                    await j.send_str('LOSE:' + winningPoints)
                    await j.close()
                activeConnections.remove(j)
            break

    activeConnections.remove(ws)
    print('removed')
    return ws
