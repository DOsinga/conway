from projects.common import Project


def entry(title, hash, screenshot, description, static_base):
    return {
        'title': title,
        'hash': hash,
        'screenshot': static_base + screenshot + '.png',
        'description': description,
    }


class Conway(Project):
    def fill_dict(self, request, d):
        d['size'] = int(request.GET.get('size', 30))
        static_base = '/static/projects/conway/'
        d['entries'] = [
            entry('Self sort', 'a9HHHHaH9HHHaHH9HHaHHH9HaHHHH9', 'colorsort',
                  'Same colors are attracted to same colors, leading to clustering after a whileredglue.',
                  static_base),
            entry('3 cycle', 'UB9BUBB9U9BB', '3cycle',
                  'Three colors, each attracted to the next one with the last one '
                  'looping back to the first one. Keeps moving for a long time.',
                  static_base),
            entry('No love', 'OBBBBBOBBBBBOBBBBBOBBBBBOBBBBB', 'no_love',
                  'Five colors, all pushing each other away, leading to nice dialogonal patterns.',
                  static_base),
            entry('5 cycle', 'UB9BBBUBB9BBUBBB9BUBBBB9U9BBBB', '5cycle',
                  'Five colors, each attracted to the next one with the last one '
                  'looping back to the first one. Produces banded colored stuff.',
                  static_base),
            entry('Red glue', 'a@HHHHHHa9HHHHHHa9HHHHHHa9HHHHHHa9HHHHHHa9HHHHHHa9HHHHHH', 'redglue',
                  'Only red cells can make connections, so any cluster has at least one red cell in the '
                  'middle.',
                  static_base),
        ]
