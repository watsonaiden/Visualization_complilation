import matplotlib.pyplot as plt
import json
import csv
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from tqdm import tqdm


prunned_polygons = []
point_x, point_y = [], []

# coordinate ordering is long, lat
with open('earth-coastlines-1km.geo.json') as f:
    with open('polis_data.csv') as csv_f:
        reader = csv.DictReader(csv_f)
        for cities in reader:
            lon, lat = cities['Longitude'], cities['Latitude']
            if lon == '' or lat =='':
                continue
            point_x.append(float(lon))
            point_y.append(float(lat))


        data = json.load(f)
        coordinates_list = data['geometries'][0]['coordinates']
        
        # for polygon [[]] only two parathese allowed while geojson uses [[[]]]
        # must index twice in order to get proper shape of array
        for coordinates in tqdm(coordinates_list): 
            poly = Polygon(coordinates[0])
            good = False
            '''
            if len(coordinates[0]) > 3000:
                print(poly, flush=True)      
                x,y = poly.exterior.xy
                plt.plot(x,y)
                plt.scatter(point_x, point_y)
                plt.show()
            '''
            for point in zip(point_x, point_y):
                p = Point(point)
                if poly.contains(p):
                    prunned_polygons.append(coordinates)
                    break

data['geometries'][0]['coordinates'] = prunned_polygons     


with open('world-1km-prunned.json', 'w') as f:
    json.dump(data, f)

