import csv
import re

input_file = 'data/Acompanhamento de Processos - CLMP - CONTRATOS.csv'
output_file = 'data/CONTRATOS.csv'

def extrair_valor(*campos):
    for campo in campos:
        if campo:
            match = re.search(r'R\$\s*([\d\.,]+)', campo)
            if match:
                return match.group(1).replace('.', '').replace(',', '.')
    return '1000.00'  # Valor fictício padrão se não encontrar

with open(input_file, encoding='utf-8') as f:
    reader = csv.reader(f)
    for i in range(20):
        row = next(reader)
        if 'PC' in row and 'OBJETO' in row:
            header = row
            break
    else:
        raise Exception('Cabeçalho não encontrado')

indices = {campo: header.index(campo) for campo in header}

with open(input_file, encoding='utf-8') as f_in, open(output_file, 'w', newline='', encoding='utf-8') as f_out:
    reader = csv.reader(f_in)
    writer = csv.writer(f_out)
    writer.writerow(['id','numero','objeto','fornecedor','status','data','local','responsavel','observacao','valor'])
    for row in reader:
        if row == header:
            break
    for row in reader:
        if not any(row):
            continue
        pc = row[indices.get('PC','')] if 'PC' in indices else ''
        objeto = row[indices.get('OBJETO','')] if 'OBJETO' in indices else ''
        fornecedor = row[indices.get('CONTRATADA','')] if 'CONTRATADA' in indices else 'Não informado'
        numero = row[indices.get('N° CONTRATO','')] if 'N° CONTRATO' in indices else f'Sem número-{pc}'
        status = row[indices.get('STATUS','')] if 'STATUS' in indices else ''
        data = row[indices.get('DATA','')] if 'DATA' in indices else ''
        local = row[indices.get('LOCAL','')] if 'LOCAL' in indices else ''
        responsavel = row[indices.get('RESPONSÁVEL','')] if 'RESPONSÁVEL' in indices else ''
        observacao = row[indices.get('OBSERVAÇÃO','')] if 'OBSERVAÇÃO' in indices else ''
        valor = extrair_valor(observacao, objeto, numero)
        writer.writerow([
            pc, numero, objeto, fornecedor, status, data, local, responsavel, observacao, valor
        ])
print(f'Arquivo convertido salvo em {output_file}') 