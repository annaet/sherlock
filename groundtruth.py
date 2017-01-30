import random
import itertools
import sys
import getopt

characters = {
    'giraffe': {'sport': 'rugby', 'fruit': 'orange', 'location': 'sapphire', 'laziness': 0.1, 'hungriness': 0.8, 'sportiness': 0.5, 'shyness': 0.2, 'forgetfulness': 0.2},

    'zebra': {'sport': 'cricket', 'fruit': 'apple', 'location': 'hl2', 'laziness': 0.2, 'hungriness': 0.5, 'sportiness': 0.8, 'shyness': 0.5, 'forgetfulness': 0.2},

    'lion': {'sport': 'golf', 'fruit': 'lemon', 'location': 'amber', 'laziness': 0.3, 'hungriness': 0.8, 'sportiness': 0.2, 'shyness': 0.2, 'forgetfulness': 0.5},

    'hippopotamus': {'sport': 'football', 'fruit': 'pineapple', 'location': 'gold', 'laziness': 0.4, 'hungriness': 0.2, 'sportiness': 0.5, 'shyness': 0.8, 'forgetfulness': 0.8},

    'elephant': {'sport': 'tennis', 'fruit': 'banana', 'location': 'ruby', 'laziness': 0.5, 'hungriness': 0.5, 'sportiness': 0.2, 'shyness': 0.5, 'forgetfulness': 0.8},

    'leopard': {'sport': 'basketball', 'fruit': 'pear', 'location': 'hl1', 'laziness': 0.6, 'hungriness': 0.2, 'sportiness': 0.8, 'shyness': 0.8, 'forgetfulness': 0.5}
}

# in order of laziness
movementOrder = ('giraffe', 'zebra', 'lion', 'hippopotamus', 'elephant', 'leopard')
visibileLocations = ('ruby', 'sapphire', 'gold', 'amber', 'emerald', 'silver')
hiddenLocations = ('hl1', 'hl2', 'hl3', 'hl4', 'hl5', 'hl6')
turns = 20
N = 10000
roomMap = {}

# for calculating probabilities
occuranceMatrix = {}
probabilityMatrix = []


def printRoomMap():
    print "room character sport fruit"
    for room in roomMap:
        c = '-'
        s = '-'
        f = '-'

        if 'character' in roomMap[room]:
            c = roomMap[room]['character']
        if 'sport' in roomMap[room]:
            s = roomMap[room]['sport']
        if 'fruit' in roomMap[room]:
            f = roomMap[room]['fruit']

        print room + " " + c + " " + s + " " + f
    return


def roomEmpty(room):
    return not ('character' in roomMap[room] or 'sport' in roomMap[room] or 'fruit' in roomMap[room])


def moveToRoom(room, character, sport, fruit):
    # print 'move to room: ' + character + ' to ' + room + ' ' + str(sport) + ' ' + str(fruit) + '\n'

    # get current room
    currentRoom = characters[character]['location']
    del roomMap[currentRoom]['character']

    if 'sport' in roomMap[currentRoom]:
        # move sport
        if sport:
            del roomMap[currentRoom]['sport']
            roomMap[room]['sport'] = characters[character]['sport']
        else:
            characters[character]['sport location'] = currentRoom

    if 'fruit' in roomMap[currentRoom]:
        # move fruit
        if fruit:
            del roomMap[currentRoom]['fruit']
            roomMap[room]['fruit'] = characters[character]['fruit']
        else:
            characters[character]['fruit location'] = currentRoom

    # move character
    roomMap[room]['character'] = character
    characters[character]['location'] = room

    if 'fruit' in roomMap[room] and 'fruit location' in characters[character]:
        del characters[character]['fruit location']
    if 'sport' in roomMap[room] and 'sport location' in characters[character]:
        del characters[character]['sport location']

    return


def generateOccuranceMatrix():
    for i, val in enumerate(visibileLocations):
        occuranceMatrix[val] = {}

        for char in characters:
            location = characters[char]['location']
            fruit = characters[char]['fruit']
            sport = characters[char]['sport']

            n = 0
            if location == val:
                n = 1

            occuranceMatrix[val][char] = n
            occuranceMatrix[val][fruit] = n
            occuranceMatrix[val][sport] = n

    for i, val in enumerate(hiddenLocations):
        occuranceMatrix[val] = {}

        for char in characters:
            fruit = characters[char]['fruit']
            sport = characters[char]['sport']

            n = 0
            if location == val:
                n = 1

            occuranceMatrix[val][char] = n
            occuranceMatrix[val][fruit] = n
            occuranceMatrix[val][sport] = n


def generateMap():
    for room in visibileLocations:
        roomMap[room] = {}
    for room in hiddenLocations:
        roomMap[room] = {}


def assignStartingRooms():
    for char in characters:
        starting = characters[char]['location']
        roomMap[starting]['character'] = char
        roomMap[starting]['sport'] = characters[char]['sport']
        roomMap[starting]['fruit'] = characters[char]['fruit']

    # printRoomMap()
    # print ''


def runTurn():
    for c in movementOrder:
        sh = random.random()
        hu = random.random()
        sp = random.random()
        la = random.random()

        move = False
        takeFruit = True
        takeSport = True
        highestMove = 0

        current = characters[c]['location']

        # if shy & not in hidden location, try and move to hidden location
        if characters[c]['shyness'] > sh:
            if characters[c]['location'] not in hiddenLocations:
                aim = hiddenLocations[random.randint(0, len(hiddenLocations) - 1)]
                canMove = roomEmpty(aim)
                if canMove:
                    move = True
                    # print 'move to hidden room'
                    highestMove = sh

        # if hungry & not with food, try and move to food
        if characters[c]['hungriness'] > hu:
            if 'fruit' not in roomMap[current]:
                if hu > highestMove:
                    aim = characters[c]['fruit location']
                    move = True
                    # print 'move to food'
                    if move:
                        highestMove = hu

        # if sporty & not with sport, try and move to sport
        if characters[c]['sportiness'] > sp:
            if 'sport' not in roomMap[current]:
                if sp > highestMove:
                    aim = characters[c]['sport location']
                    move = True
                    # print 'move to sport'
                    if move:
                        highestMove = sp

        # if not lazy, try and move somewhere
        if characters[c]['laziness'] < la:
            if la > highestMove:
                newAim = visibileLocations[random.randint(0, len(visibileLocations) - 1)]
                canMove = roomEmpty(newAim)
                if canMove:
                    aim = newAim
                    move = True
                    # print 'move to random room'
                    highestMove = la

        # if moving, try and move with or without items
        if move:
            f = random.random()
            if characters[c]['forgetfulness'] > f:
                takeFruit = False

            f = random.random()
            if characters[c]['forgetfulness'] > f:
                takeSport = False
            moveToRoom(aim, c, takeFruit, takeSport)


# run N times to generate probabilities
def generateProbabilities():
    for _ in itertools.repeat(None, N):
        for index in range(0, turns):
            runTurn()

            for room in roomMap:
                if 'character' in roomMap[room]:
                    c = roomMap[room]['character']
                    occuranceMatrix[room][c] += 1
                if 'sport' in roomMap[room]:
                    s = roomMap[room]['sport']
                    occuranceMatrix[room][s] += 1
                if 'fruit' in roomMap[room]:
                    f = roomMap[room]['fruit']
                    occuranceMatrix[room][f] += 1


def generateProbabilityMatrix():
    # calculate probability matrix
    totalTurns = turns * N

    # heading
    arr = ['room']

    for c in movementOrder:
        arr.append(c)
    for c in movementOrder:
        fruit = characters[c]['fruit']
        arr.append(fruit)
    for c in movementOrder:
        sport = characters[c]['sport']
        arr.append(sport)

    probabilityMatrix.append(arr)

    # body
    for room in occuranceMatrix:
        arr = [room]

        for c in movementOrder:
            cOccurances = occuranceMatrix[room][c]
            arr.append(float(cOccurances) / totalTurns)
        for c in movementOrder:
            fruit = characters[c]['fruit']
            fOccurances = occuranceMatrix[room][fruit]
            arr.append(float(fOccurances) / totalTurns)
        for c in movementOrder:
            sport = characters[c]['sport']
            sOccurances = occuranceMatrix[room][sport]
            arr.append(float(sOccurances) / totalTurns)

        probabilityMatrix.append(arr)


def printProbabilityMatrix():
    for row in probabilityMatrix:
        print ",".join(map(str, row))
    return


def setup():
    generateOccuranceMatrix()
    generateMap()
    assignStartingRooms()


def getProbabilityMatrix():
    setup()
    generateProbabilities()
    generateProbabilityMatrix()
    printProbabilityMatrix()
    sys.stdout.flush()


def generateGameConfig(turns):
    setup()

    for num in range(0, int(turns)):
        runTurn()
        printRoomMap()
        print ""

    # TODO: print game config in useful format
    sys.stdout.flush()


# get arguments
argv = sys.argv[1:]
try:
    opts, args = getopt.getopt(argv, "gr:")
except getopt.GetoptError:
    print 'groundtruth.py -f <function>'
    sys.exit(2)
for opt, arg in opts:
    if opt == '-g':
        print 'Function is getProbabilityMatrix()'
        getProbabilityMatrix()
    elif opt == '-r':
        # print 'Run game'
        generateGameConfig(arg)
