const JWTUtils = require('../src/utils/jwtUtils');

/**
 * Script para testar a funcionalidade completa de JWT
 */
async function testJWTFunctionality() {
    console.log('🔐 Testando funcionalidade completa de JWT...\n');

    try {
        // Dados de usuário de teste
        const testUser = {
            id: 1,
            email: 'teste@exemplo.com',
            name: 'Usuário Teste'
        };

        // Teste 1: Geração de token de acesso
        console.log('1. Testando geração de token de acesso:');
        const accessToken = await JWTUtils.generateToken(testUser);
        console.log(`   ✅ Token gerado: ${accessToken.substring(0, 50)}...`);

        // Teste 2: Geração de refresh token
        console.log('\n2. Testando geração de refresh token:');
        const refreshToken = await JWTUtils.generateRefreshToken(testUser);
        console.log(`   ✅ Refresh token gerado: ${refreshToken.substring(0, 50)}...`);

        // Teste 3: Verificação de token válido
        console.log('\n3. Testando verificação de token válido:');
        const decoded = await JWTUtils.verifyToken(accessToken);
        console.log(`   ✅ Token verificado com sucesso`);
        console.log(`   👤 Usuário: ${decoded.name} (${decoded.email})`);
        console.log(`   🔑 Token ID: ${decoded.tokenId}`);
        console.log(`   ⏰ Expira em: ${new Date(decoded.exp * 1000).toLocaleString()}`);

        // Teste 4: Decodificação sem verificação
        console.log('\n4. Testando decodificação sem verificação:');
        const decodedPayload = JWTUtils.decodeToken(accessToken);
        console.log(`   ✅ Payload decodificado: ${decodedPayload.type}`);

        // Teste 5: Verificação de expiração
        console.log('\n5. Testando verificação de expiração:');
        const isExpired = JWTUtils.isTokenExpired(accessToken);
        console.log(`   ${isExpired ? '❌' : '✅'} Token ${isExpired ? 'expirado' : 'válido'}`);

        // Teste 6: Formatação de resposta de autenticação
        console.log('\n6. Testando formatação de resposta:');
        const authResponse = JWTUtils.formatAuthResponse(testUser, accessToken, refreshToken);
        console.log(`   ✅ Resposta formatada:`);
        console.log(`   📋 Sucesso: ${authResponse.success}`);
        console.log(`   👤 Usuário: ${authResponse.data.user.name}`);
        console.log(`   🔑 Tipo de token: ${authResponse.data.tokens.type}`);
        console.log(`   ⏰ Expira em: ${authResponse.data.tokens.expiresIn}`);

        // Teste 7: Token inválido
        console.log('\n7. Testando token inválido:');
        try {
            await JWTUtils.verifyToken('token.invalido.aqui');
            console.log('   ❌ Deveria ter falhado');
        } catch (error) {
            console.log(`   ✅ Token inválido rejeitado: ${error.message}`);
        }

        // Teste 8: Token com Bearer prefix
        console.log('\n8. Testando token com prefixo Bearer:');
        const bearerToken = `Bearer ${accessToken}`;
        const decodedBearer = await JWTUtils.verifyToken(bearerToken);
        console.log(`   ✅ Token Bearer verificado: ${decodedBearer.email}`);

        // Teste 9: Casos extremos
        console.log('\n9. Testando casos extremos:');
        
        // Token vazio
        try {
            await JWTUtils.verifyToken('');
            console.log('   ❌ Token vazio deveria ter falhado');
        } catch (error) {
            console.log('   ✅ Token vazio rejeitado corretamente');
        }

        // Usuário inválido para geração
        try {
            await JWTUtils.generateToken({});
            console.log('   ❌ Usuário inválido deveria ter falhado');
        } catch (error) {
            console.log('   ✅ Usuário inválido rejeitado corretamente');
        }

        console.log('\n🎉 Todos os testes de JWT concluídos com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante os testes de JWT:', error);
    }
}

// Executa os testes se este arquivo for executado diretamente
if (require.main === module) {
    testJWTFunctionality();
}

module.exports = testJWTFunctionality;