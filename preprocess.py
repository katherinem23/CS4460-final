
import pandas as pd
file = pd.read_csv('Team W:L (2022 - 2023).csv')

file = file.iloc[:, :24]

file = file.drop(columns=['B'])


file = file.dropna()



win_counts = {}
file['PCT'] = file['W/L']

for index, row in file.iterrows():
    team = row['Team']
    result = row['W/L']
    
    
    if team not in win_counts:
        win_counts[team] = 0
    
    if result == 'W':
        win_counts[team] += 1
    
    file.at[index, 'PCT'] = win_counts[team]

        
file['PCT'] = file['PCT'] / file['G']

file['Date'] = pd.to_datetime(file['Date'], format='%m/%d/%y').dt.strftime('%Y-%m-%d')


file.to_csv('practice.csv', index=False)