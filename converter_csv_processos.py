import csv
import os
from datetime import datetime

# Arquivo de entrada (mais recente)
input_file = 'data/Acompanhamento de Processos - CLMP - 13-05.csv'
output_file = 'data/PROCESSOS.csv'

# Mapeamento dos campos
mapa = {
    'PROCESSO': 'PC',
    'OBJETO': 'OBJETO',
    'REQUISITANTE': 'PASTA',
    'STATUS': 'STATUS',
    'DATA ENTRADA  NA CLMP': 'ENTRADA  NA CLMP',
    'DATA': 'DATA',
    'RESPONSÁVEL': 'RESPONSÁVEL',
    'LOCAL': 'LOCAL',
    # OBSERVAÇÃO não existe, será preenchido vazio
}

# Encontrar o cabeçalho correto (pular linhas iniciais)
with open(input_file, encoding='utf-8') as f:
    reader = csv.reader(f)
    for i in range(20):
        row = next(reader)
        if 'PROCESSO' in row:
            header = row
            break
    else:
        raise Exception('Cabeçalho não encontrado')

# Índices dos campos
indices = {campo: header.index(campo) for campo in mapa if campo in header}

# Ler e converter
with open(input_file, encoding='utf-8') as f_in, open(output_file, 'w', newline='', encoding='utf-8') as f_out:
    reader = csv.reader(f_in)
    writer = csv.writer(f_out)
    # Escrever cabeçalho novo
    writer.writerow(['PC','OBJETO','PASTA','STATUS','ENTRADA  NA CLMP','DATA','RESPONSÁVEL','LOCAL','OBSERVAÇÃO'])
    # Pular até o cabeçalho
    for row in reader:
        if row == header:
            break
    # Escrever dados convertidos
    for row in reader:
        if not any(row):
            continue
        nova = [row[indices.get('PROCESSO','')] if 'PROCESSO' in indices else '',
                row[indices.get('OBJETO','')] if 'OBJETO' in indices else '',
                row[indices.get('REQUISITANTE','')] if 'REQUISITANTE' in indices else '',
                row[indices.get('STATUS','')] if 'STATUS' in indices else '',
                row[indices.get('DATA ENTRADA  NA CLMP','')] if 'DATA ENTRADA  NA CLMP' in indices else '',
                row[indices.get('DATA','')] if 'DATA' in indices else '',
                row[indices.get('RESPONSÁVEL','')] if 'RESPONSÁVEL' in indices else '',
                row[indices.get('LOCAL','')] if 'LOCAL' in indices else '',
                '']
        writer.writerow(nova)
print(f'Arquivo convertido salvo em {output_file}') 