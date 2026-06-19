export interface ColaboradorConfig {
  nomeExibicao: string
  nomeCompleto: string
  abaSheet: string
}

export const COLABORADORES: ColaboradorConfig[] = [
  { nomeExibicao: 'Amanda',   nomeCompleto: 'AMANDA GIULLIA PEREIRA DIAS DA MOTTA', abaSheet: 'Amanda'         },
  { nomeExibicao: 'Ana Iris', nomeCompleto: 'ANA IRIS DA SILVA RAMOS DE SOUZA',     abaSheet: 'Ana e Bruna'    },
  { nomeExibicao: 'Ana Julia',nomeCompleto: 'ANA JÚLIA RAMOS REZENDE',              abaSheet: 'Ana Julia'      },
  { nomeExibicao: 'Bruna',    nomeCompleto: 'BRUNA DA SILVA',                        abaSheet: 'Ana e Bruna'    },
  { nomeExibicao: 'Dalmo',    nomeCompleto: 'DALMO HUSSID FERREIRA',                abaSheet: 'Dalmo'          },
  { nomeExibicao: 'Julia',    nomeCompleto: 'JÚLIA ANDALECIO LEMES',                abaSheet: 'Julia'          },
  { nomeExibicao: 'Laísa',    nomeCompleto: 'LAÍSA NUNES DA CUNHA',                 abaSheet: 'Laísa'          },
  { nomeExibicao: 'Luana',    nomeCompleto: 'LUANA SIQUEIRA DA SILVA',              abaSheet: 'Luana e Tércio' },
  { nomeExibicao: 'Mari',     nomeCompleto: 'MARIANA NUNES DE SANTANA',             abaSheet: 'Mari'           },
  { nomeExibicao: 'Paulo',    nomeCompleto: 'PAULO VICTOR MOREIRA DE OLIVEIRA',     abaSheet: 'Pedro e Paulo'  },
  { nomeExibicao: 'Pedro',    nomeCompleto: 'PEDRO AUGUSTO SANCHES SELLA',          abaSheet: 'Pedro e Paulo'  },
  { nomeExibicao: 'Tércio',   nomeCompleto: 'TERCIO STRUTZEL CORONADO',             abaSheet: 'Luana e Tércio' },
  { nomeExibicao: 'Thais',    nomeCompleto: 'THAÍS AMADEU PESSIM',                  abaSheet: 'Thais'          },
]

export function encontrarColaborador(nomeExibicao: string): ColaboradorConfig | undefined {
  return COLABORADORES.find((c) => c.nomeExibicao === nomeExibicao)
}
