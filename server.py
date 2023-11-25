from views import *

from aiohttp import web
app = web.Application()

app.router.add_get('/game/{code}', game)
app.router.add_get('/newgame', newgame)
app.router.add_get('/game_ws', ws)

async def shutdown(request):
    from aiohttp.web_runner import GracefulExit
    raise GracefulExit()
app.router.add_get('/shutdown', shutdown)

app.router.add_get('/{p:.*}', file)

web.run_app(app, port=23506)
