class Game:

    games = []

    def __init__(self, nMoves2Win=5):
        self.initcode()
        self.moves = [] # stores alternating moves
        self.nMoves2Win = nMoves2Win
        Game.games.append(self)

    def initcode(self):
        from random import randrange
        self.code = randrange(1296, 46656) # 3 digit 36-base number
        for i in Game.games:
            if i.code == self.code:
                self.initcode()
                return

    def winningPoints(self, pos):
        self.moves.append(pos)
        mymoves = tuple(self.moves[::-2])

        scales = [
            (+1, 0), # horizontal
            (0, +1), # vertical
            (+1,+1), # diagonal (towards bottom right)
            (-1,+1)] # diagonal (towards top right)

        return any((self._checkLine(mymoves, pos, *i) for i in scales))

    def _checkLine(self, mymoves, pos, scaleX, scaleY):
        chain = []
        for i in range(-self.nMoves2Win, self.nMoves2Win+1):
            i_pos = pos[0] + i*scaleX, pos[0] + i*scaleY
            if i_pos in mymoves:
                chain.append(i_pos)
            else: # chain interrupted
                chain = []

        return chain if len(chain) >= self.nMoves2Win else False

    def codeStr(self):
        i = self.code
        s = ''
        for j in range(3):
            s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i%36] + s
            i //= 36
        return s

    def newgame():
        return Game().codeStr()

    def forcode(code):
        if len(code) != 3:
            return False
        try:
            code = int(code, 36)
        except ValueError:
            return False

        for i in Game.games:
            if i.code == code:
                return i
        return None

g = Game()
g.code = 6075
print('Generated:', g.codeStr())
