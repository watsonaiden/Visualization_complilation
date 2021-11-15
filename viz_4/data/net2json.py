import json

filename_nodes = 'terrorists_node_map.txt'
filename_links = 'terrorists.net'



json_dict = {}
json_dict['nodes'] = []
json_dict['links'] = []

with open(filename_nodes, 'r') as f_node:
    lines = f_node.readlines()
    for line in lines:
        items = line.split(maxsplit=1)
        # first item is id then name
        node_dict = {'id': items[0], 'name':items[1].rstrip(' \n'), 'value': 0}
        json_dict['nodes'].append(node_dict)


with open(filename_links, 'r') as f_links:
    lines = f_links.readlines()
    for line in lines:
        items = line.split()
        # first item is source then target
        link_dict = {'source':items[0], 'target':items[1], 'value':1}
        json_dict['links'].append(link_dict)
        json_dict['nodes'][int(items[0])]['value'] += 1
        json_dict['nodes'][int(items[1])]['value'] += 1


with open('terrorists.json', 'w') as f:
    json.dump(json_dict, f, ensure_ascii=False, indent=4)



