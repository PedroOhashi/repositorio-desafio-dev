# Relatório do desafio: Folhagem & Cia

Nome: Pedro Ohashi Ramos

Branch: desafio/pedro 

Repositório: https://github.com/PedroOhashi/repositorio-desafio-dev

# 1. O que foi feito
Construí a API da Folhagem & Cia com Node.js, Express, TypeScript, Prisma e PostgreSQL, rodando em Docker. Implementei as 7 rotas obrigatórias e as 7 regras de negócio do enunciado:

*POST /plantas*: cadastra uma planta (201). Todos os campos são obrigatórios.

*GET /plantas*: lista as plantas, com os filtros opcionais ?luminosidade= e ?petFriendly=, sozinhos ou juntos (200).

*GET /plantas/:id*: busca uma planta (200, 404 ou 400).

*PATCH /plantas/:id*: edita só os campos enviados (200, 400 ou 404).

*DELETE /plantas/:id*: remove uma planta (204, 404 ou 400).

*POST /plantas/:id/venda*: diminui o estoque e nunca deixa ele ficar negativo (200 ou 400).

*GET /plantas/estoque/valor-total*: soma preco × estoque e o total de vasos (200).

Dados inválidos no cadastro, na edição, nos filtros e na venda retornam 400 com uma mensagem clara. Id que não existe retorna 404.

*Bônus*: fiz e testei os quatro: busca por nome sem diferenciar maiúsculas (?nome=), ordenação (?ordem=preco ou ?ordem=nome), a rota GET /plantas/esgotadas e um script de seed (yarn seed) que cadastra 6 plantas de exemplo e não duplica se o banco já tiver dados.

*O que ficou de fora*: pelo que eu li e interpretei do desafio nao ficou nada de fora, realizei também os bonus que aparecerao em breve como eu realizei.

# 2. Como foi feito

Primeiro subi o projeto na minha máquina (Mac) com Docker, li o CRUD de usuários (rotas, controller, repository e schema) e testei ele no Thunder Client para entender o fluxo de uma requisição. Depois trabalhei na ordem que o enunciado sugere, com um commit ao fim de cada etapa: model e migration, repository, controller, rotas, filtros, venda, valor total e, por último, os bônus.

*As principais decisões e os motivos:*

. *Camadas como no CRUD de usuário*. A rota liga a URL à função, o controller valida e escolhe o status, e só o repository conversa com o Prisma.

. *Uma função de validação para cadastro e edição*. A validarCampos recebe um parâmetro obrigatorios: no cadastro todos os campos precisam vir, e na edição só os enviados são conferidos, mas com as mesmas regras.

. *Comparação com undefined em vez de !campo*. Como !0 e !false são verdadeiros, !estoque recusaria estoque: 0 e !petFriendly recusaria toda planta não pet-friendly, e as duas são válidas.

. *Só os campos da planta vão ao banco*. Desestruturei o req.body em vez de passá-lo inteiro, para que um campo extra (como id) não chegue ao banco.

. *Validação do :id com a função lerId*. Ela recusa abc, 0, negativos e decimais com 400. Além do que o enunciado pede (Number.isInteger(id) && id > 0), coloquei um limite máximo de 2147483647, que é o maior valor da coluna Int do banco. Sem ele, um id gigante passaria pela validação e viraria um 500 no Prisma. Essa é uma decisão minha, além do enunciado.

. *Buscar antes de editar, deletar ou vender*. Assim um id inexistente responde 404 em vez de cair no catch como 500.

. *Duas pessoas comprando o último vaso ao mesmo tempo*. A venda faz a conferência e a diminuição numa única operação do banco: um updateMany com where: { estoque: { gte: quantidade } } e decrement. Se a segunda compra chegar tarde, nenhuma linha é alterada e a API responde 400, então o estoque nunca fica negativo. O controller também confere o estoque antes, para devolver a mensagem "temos só X vasos".

. *Valor total calculado no código*. O aggregate do Prisma soma uma coluna, mas não multiplica duas. Busquei só preco e estoque (com select) e fiz a conta num laço. Com a loja vazia, o resultado é 200 com os valores zerados.

. *Ordem das rotas*. /plantas/estoque/valor-total e /plantas/esgotadas ficam antes de /plantas/:id, porque o Express usa a primeira rota que combinar e, senão, "esgotadas" seria tratado como um id.

. *Filtros*. Os filtros chegam como texto, então converti "true" para booleano mas mantive undefined quando o filtro não foi enviado (se virasse false, a listagem sem filtro mostraria só as plantas não pet-friendly). Filtro inválido é 400, e filtro válido sem resultado é 200 com [].

Nao foi tomada nenhuma decisao diferente do que estava presente no enunciado

# 3. Principais dificuldades

*Vermelho no PlantaRepository.ts.*: O editor sublinhava prisma.planta e PlantaCreateInput, mesmo com o código certo. Rodei yarn typecheck, que passou sem erro, e entendi que o VS Code só estava com os tipos desatualizados depois da migration (o Restart TS Server resolve). Ainda no final do projeto alguns arquivos ficaram em vermelho e aqui eu utilizei a IA para tentar me auxiliar no o que fazer para concertar ou se existia realmente algum erro ou nao, utilizei o claude, e ele disse que na verdade poderia ser apenas uma desatualizacao, entao permaneceu da mesma maneira, mas não teve nenhum problema.

*O repositório na minha conta.* O link do desafio era de outra conta e o enunciado não pedia para alterá-lo. Criei um repositório novo na minha conta, apontei o origin para ele e enviei a main e a branch desafio/pedro. Tive um pouco de dificuldade e fiquei um pouco confuso, pois o repositorio agora possui duas branchs, que são uma 'main' onde temos o commit inicial com o repositorio fornecido e ua outra branch com todas as alteracoes e o projeto em si.

*O 500 no GET /users/abc.* Ao testar o CRUD de usuário vi que um id inválido vira NaN e o erro do Prisma cai no catch como 500. Isso me mostrou por que as plantas precisavam validar o id e responder 400. Por isso nessa parte utilizei a IA, o claude, para me auxiliar e ele me passou um codigo que quando implementado, foi resolvido o problema nesse erro especifico, mesmo com a ajuda do claude, eu li todo o codigo e presetei atenção em como resolver o problema.

# 4. Uso de IA

Usei o Claude para me guiar passo a passo na instalação e no uso das ferramentas (Docker, Git, VS Code, Thunder Client, GitHub).

Me auxiliou também em: Me explicar a estrutura do projeto e o fluxo de uma requisição (rotas, controller, repository e banco).

E por fim o que eu mais utilizei, explicar erros e comportamentos que eu não entendia.

*O que ajustei no código que a IA passou*: Em diversos trechos quando eu utilizava o claude, ele gerava códigos para mim mesmo sem eu pedir e alguns desses códigos eu ignorava e outros eu reutilizava, reutilizei principalmente mais códigos no PlantaController.ts, eu alterava algumas estruturas que eu nao entendia pedia para ele me explicar e eu replicava de uma maneira que eu entendesse.

*Como conferi o que a IA respondeu*:

. Li o código de cada etapa antes de seguir para a próxima e fui entendendo parte por parte, em vez de só colar.

. Pesquisei para conferir informações. Muitas vezes quando a IA me fornecia os códigos, eu pesquisava para entender melhor como funcionava e conferir informações relacionadas a códigos, como contéudos de js e ts.

. Testei cada rota no Thunder Client, passando pelos casos da tabela do enunciado, principalmente os de erro (400, 404 e o 204 do delete).

. Rodei yarn typecheck depois de cada etapa, e ele passou sem erros.

. Conferi o valor total fazendo a conta na mão e comparando com a resposta da API: os números bateram.

. Confirmei que a venda não altera o estoque quando devolve 400, buscando a planta de novo depois do erro.

*O que aprendi:* Aprendi bastante coisa, principalmente relacionada a banco de dados, e aprendi um básico de type script e java script para implementar as seeds, o desafio estava muito bem formulado e deu para aprender BASTANTE coisa durante todo o desafio, principalmente git e github, eu era um pouco leigo nessas ferramentas, mas agora ja estou com um bom dominio graças a esse desafio e ao desafio de Dados.