import pandas as pd


cols = ['date','id', 'tweet','replies_count', 'retweets_count', 'likes_count']
bitcoin_tweets = []

df = pd.read_csv('TweetsElonMusk.csv', usecols=cols)

for index, row in df.iterrows():
    if 'bitcoin' in row['tweet'] or 'Bitcoin' in row['tweet']:
        
        bitcoin_tweets.append(row)
        print('bitcoin tweet found', row['date'])


with open('bitcoin_tweets.csv', 'wb') as f:
    csv_cols = ''.join(e+',' for e in cols) + '\n'
    csv_cols = csv_cols.encode('utf-8')
    f.write(csv_cols)
    for i in bitcoin_tweets:
        s = ''
        for j in cols:
            s += str(i[j]) + ','

        s += '\n'
        s = s.encode('utf-8')
        f.write(s)
        
