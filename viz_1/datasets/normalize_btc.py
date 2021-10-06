

op = []
with open('BTC-USD.csv', 'r') as f:
    Lines = f.readlines()
    Lines = Lines[1:]
    print(Lines[:5]) 
    for l in Lines:
        #second item is open price
        op.append(float(l.split(',')[1]))

bt_min, bt_max = min(op), max(op)


with open('btc_normalized.csv', 'w') as f:
    f.write('Date,normalized_price\n')
    for l in Lines:
        line_split = l.split(',') 
        op_price = float(line_split[1])
        date = line_split[0]
        # normalize value to 0 - 100
        normalized = (op_price - bt_min) / (bt_max - bt_min) * 100
        f.write(date+','+str(normalized)+'\n')

