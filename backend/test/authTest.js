const AuthUtils = require('../src/utils/authUtils');

/**
 * Script para testar a funcionalidade de autenticação
 */
async function testPasswordFunctionality() {
    console.log('🧪 Testando funcionalidade de autenticação...\n');

    try {
        // Teste 1: Validação de força da senha
        console.log('1. Testando validação de força da senha:');
        
        const weakPassword = '123';
        const weakResult = AuthUtils.validatePasswordStrength(weakPassword);
        console.log(`   Senha fraca "${weakPassword}":`, weakResult.isValid ? '✅ Válida' : '❌ Inválida');
        if (!weakResult.isValid) {
            console.log(`   Erros: ${weakResult.errors.join(', ')}`);
        }

        const strongPassword = 'MinhaSenh@123';
        const strongResult = AuthUtils.validatePasswordStrength(strongPassword);
        console.log(`   Senha forte "${strongPassword}":`, strongResult.isValid ? '✅ Válida' : '❌ Inválida');

        // Teste 2: Hash de senha
        console.log('\n2. Testando criação de hash:');
        const testPassword = 'TestPassword123!';
        const hashedPassword = await AuthUtils.hashPassword(testPassword);
        console.log(`   Hash gerado: ${hashedPassword.substring(0, 30)}...`);

        // Teste 3: Comparação de senhas
        console.log('\n3. Testando comparação de senhas:');
        
        const correctComparison = await AuthUtils.comparePasswords(testPassword, hashedPassword);
        console.log(`   Senha correta: ${correctComparison ? '✅ Match' : '❌ No match'}`);

        const incorrectComparison = await AuthUtils.comparePasswords('WrongPassword', hashedPassword);
        console.log(`   Senha incorreta: ${incorrectComparison ? '❌ Match (ERRO!)' : '✅ No match'}`);

        // Teste 4: Proteção contra timing attacks
        console.log('\n4. Testando proteção contra timing attacks:');
        console.time('   Dummy comparison time');
        await AuthUtils.dummyPasswordCompare();
        console.timeEnd('   Dummy comparison time');

        // Teste 5: Casos extremos
        console.log('\n5. Testando casos extremos:');
        
        try {
            await AuthUtils.hashPassword('');
            console.log('   Senha vazia: ❌ Deveria ter falhado');
        } catch (error) {
            console.log('   Senha vazia: ✅ Rejeitada corretamente');
        }

        const invalidHashComparison = await AuthUtils.comparePasswords('test', 'invalid_hash');
        console.log(`   Hash inválido: ${invalidHashComparison ? '❌ Match (ERRO!)' : '✅ No match'}`);

        console.log('\n🎉 Todos os testes concluídos!');

    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

// Executa os testes se este arquivo for executado diretamente
if (require.main === module) {
    testPasswordFunctionality();
}

module.exports = testPasswordFunctionality;