HASH_CHARS = '!@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

NUM_COLORS = 7


def with_value(value=0.0, *, num_colors=7):
    return [[value for x in range(num_colors + 1)] for y in range(num_colors)]


def encode(m):
    def encode_row(row):
        return ''.join(HASH_CHARS[int((x + 0.25) * len(HASH_CHARS))] for x in row)

    return ''.join(encode_row(r) for r in m)


def likes_self(num_colors=NUM_COLORS):
    m = with_value(-0.1, num_colors=num_colors)
    for x in range(num_colors):
        m[x][0] = 0.2
        m[x][x + 1] = 0.74
    return m


def red_kernels(num_colors=NUM_COLORS):
    m = with_value(-0.1, num_colors=num_colors)
    for x in range(num_colors):
        m[x][0] = 0
        if x > 0:
            m[x][1] = 0.74
    return m


def neighbors(num_colors=NUM_COLORS):
    m = with_value(-0.1)
    for x in range(num_colors):
        m[x][0] = 0
        m[x][x + 1] = -0.25
        x1 = 1 + (x + 1) % num_colors
        m[x][x1] = 0.5
    return m


def middle(num_colors=NUM_COLORS):
    m = with_value(0.2)
    for x in range(num_colors):
        m[x][0] = -0.25
        m[x][x + 1] = 0.5
    return m


def popular(num_colors=NUM_COLORS):
    m = with_value(0)
    for x in range(num_colors):
        m[x][0] = -0.1
        f = x / (num_colors * 2)
        for y in range(num_colors):
            m[x][y + 1] = f
            if x == y:
                m[x][y + 1] += 0.2
    return m


def circle(num_colors=3):
    m = with_value(-0.2, num_colors=num_colors)
    for x in range(num_colors):
        y = (x + 1) % num_colors
        m[x][0] = 0.1
        m[x][y + 1] = 0.74
    return m


def no_love(num_colors=3):
    m = with_value(-0.2, num_colors=num_colors)
    for x in range(num_colors):
        m[x][0] = 0.0
    return m


for fn, params in [
        (likes_self, 2),
        (likes_self, 5),
        (red_kernels, 5),
        (neighbors, None),
        (middle, None),
        (popular, None),
        (no_love, 5),
        (circle, 3),
        (circle, 4),
        (circle, 5)]:
    name = fn.__name__.replace('_', '-')
    if params is None:
        params = NUM_COLORS
    else:
        name += '-' + str(params)
    code = fn(params)
    print(name, encode(code))
