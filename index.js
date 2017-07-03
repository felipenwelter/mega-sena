import { create } from 'rung-sdk';
import { String as Text, Double } from 'rung-cli/dist/types';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import Bluebird from 'bluebird';
import numeral from 'numeral';

const request = promisifyAgent(agent, Bluebird);

function render(n1, n2, n3, n4, n5, n6, xAcertos, cPremio, cMsg){
    return _("Numeros sorteados: {{n1}}, {{n2}}, {{n3}}, {{n4}}, {{n5}}, {{n6}} | Acertos: {{xAcertos}} | Premio: {{cPremio}} | {{cMsg}}",
        {n1, n2, n3, n4, n5, n6, xAcertos, cPremio, cMsg});
}

function main(context, done) {
    const { n1, n2, n3, n4, n5, n6} = context.params;

    request.get('https://api.vitortec.com/loterias/megasena/v1.2/')
    .then(resultado => {

        const cConcurso = resultado.body.data.concurso;
		const cDtSorteio = resultado.body.data.data;
        var r = resultado.body.data.resultado.ordemCrescente;
        var x = r.slice(0); //cria copia do array de resultados
		var n = [n1,n2,n3,n4,n5,n6];
        var xAcertos = 0;
        var nPessoas = 0;
        var cPremio = '';
        var cMsg = ' ';
        var alertas = [];

		//compara cada numero do resultado com os numeros informados
		for (var nR = 0; nR < 6; nR++){
			for (var nN = 0; nN < 6; nN++){
				if (r[nR] == n[nN]){
					xAcertos++;
					//substitui numero do resultado para nao somar repetidos
					//ex: se apostar 3,3,3,4,5,6
					r.splice(nR,0,-1);
					r.splice(nR+1,1);
				}
			}
		}

        //verifica se ganhou algum premio
        if(xAcertos == 6){ //acertou a sena
            cPremio = 'R$ '+resultado.body.data.ganhadores.sena.valor;
            nPessoas = resultado.body.data.ganhadores.sena.quantidade;
        }else if (xAcertos == 5){ //acertou a quina
            cPremio = 'R$ '+resultado.body.data.ganhadores.quina.valor;
            nPessoas = resultado.body.data.ganhadores.quina.quantidade;
        }else if (xAcertos == 4){ //acertou a quadra
            cPremio = 'R$ '+resultado.body.data.ganhadores.quadra.valor;
            nPessoas = resultado.body.data.ganhadores.quadra.quantidade;
        }else{
            cPremio = ' nenhum '
            nPessoas = 0;
			if ((xAcertos) == 0) {
				xAcertos = 'nenhum'
			}
        }

		//verifica o numero de ganhadores
        if (nPessoas == 1){
            cMsg = 'ganhou sozinho';
        }else if ( nPessoas > 0){
            cMsg = 'total de ' + (nPessoas) + ' ganhadores';
        }else{
            cMsg = 'tente de novo';
        }

		//termino
        if (true) {
            alertas.push({
                title: 'Concurso: ' + cConcurso + ' de ' + cDtSorteio,
                content: render(x[0], x[1], x[2], x[3], x[4], x[5], xAcertos, cPremio, cMsg)
            });
        }

        done ({alerts: alertas});

    });
}

const params = {
    n1: {
        description: _('Numero 01'),
        type: Double,
        required: true
    },
    n2: {
        description: _('Numero 02'),
        type: Double,
        required: true
    },
    n3: {
        description: _('Numero 03'),
        type: Double,
        required: true
    },
    n4: {
        description: _('Numero 04'),
        type: Double,
        required: true
    },
    n5: {
        description: _('Numero 05'),
        type: Double,
        required: true
    },
    n6: {
        description: _('Numero 06'),
        type: Double,
        required: true
    }
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Resultado da aposta programada!"),
    description: _("Seja informado do resultado da Mega-Sena!"),
    preview: render('Mega-Sena')
});

