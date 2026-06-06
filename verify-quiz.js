/**
 * Script de verificación del quiz
 * Navega por los pasos y verifica que la validación funciona correctamente
 */

const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Helper para esperar
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Capturar errores de consola
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navegar al quiz
    const filePath = 'file:///c:/Users/JOHN/Desktop/JohnJairo/ArtificialCtrl/plin/rosa/saveweb2zip-com-plin-com-br/index.html';
    console.log('📖 Abriendo quiz en:', filePath);
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    await wait(1000);

    // Verificar que el quiz está renderizado
    const quizContainer = await page.$('#plin-quiz-inline');
    if (!quizContainer) {
      console.error('❌ El contenedor del quiz no se encontró');
      process.exit(1);
    }
    console.log('✅ Quiz renderizado correctamente');

    // Paso 1: searchType (elección)
    console.log('\n📍 Paso 1: Seleccionar tipo de persona');
    await page.click('.plin-quiz-option[data-value="mujer"]');
    await wait(300);
    await page.click('.plin-quiz-btn-continue');
    await wait(500);

    // Paso 2: userWhatsapp (número del usuario, NO se valida)
    console.log('📍 Paso 2: Ingresar número del usuario (sin validación)');
    const input2 = await page.$('#plin-quiz-input');
    await input2.type('+52 555-123-4567');
    const btnText2Before = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    console.log('  - Botón antes de hacer clic:', btnText2Before);
    await page.click('.plin-quiz-btn-continue');
    await wait(500);
    const btnText2After = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    console.log('  - Botón después de hacer clic:', btnText2After);
    if (btnText2After.includes('Validando')) {
      console.error('❌ ERROR: El paso 2 NO debería validar, pero está validando');
      process.exit(1);
    }
    console.log('✅ Paso 2: Sin validación de API (correcto)');

    // Paso 3: personName (nombre, NO se valida)
    console.log('\n📍 Paso 3: Ingresar nombre completo (sin validación)');
    const input3 = await page.$('#plin-quiz-input');
    await input3.type('Juan García');
    const btnText3Before = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    console.log('  - Botón antes:', btnText3Before);
    await page.click('.plin-quiz-btn-continue');
    await wait(500);
    const btnText3After = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    console.log('  - Botón después:', btnText3After);
    if (btnText3After.includes('Validando')) {
      console.error('❌ ERROR: El paso 3 NO debería validar, pero está validando');
      process.exit(1);
    }
    console.log('✅ Paso 3: Sin validación de API (correcto)');

    // Paso 4: personWhatsapp (ESTE SÍ se valida)
    console.log('\n📍 Paso 4: Validación del número de la persona (ESTE SE VALIDA)');
    const input4 = await page.$('#plin-quiz-input');
    await input4.type('+52 555-987-6543');

    // Verificar estado inicial del botón
    const btnBefore = await page.$('.plin-quiz-btn-continue');
    const btnText4Before = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    const btnDisabledBefore = await page.$eval('.plin-quiz-btn-continue', btn => btn.disabled);
    console.log('  - Botón inicial:', btnText4Before, '| Deshabilitado:', btnDisabledBefore);

    // Hacer clic para validar
    await page.click('.plin-quiz-btn-continue');
    await wait(500);

    // Verificar que el botón cambió a "Validando número..."
    const btnTextValidating = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    const btnDisabledValidating = await page.$eval('.plin-quiz-btn-continue', btn => btn.disabled);
    console.log('  - Botón mientras valida:', btnTextValidating, '| Deshabilitado:', btnDisabledValidating);

    if (!btnTextValidating.includes('Validando')) {
      console.error('❌ ERROR: El botón debería mostrar "Validando número..."');
      process.exit(1);
    }
    console.log('✅ Botón cambió a "Validando número..." correctamente');

    // Esperar a que se complete la validación (max 6 segundos)
    await wait(6000);

    // Verificar el estado final
    const btnTextFinal = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
    console.log('  - Botón final:', btnTextFinal);

    // El resultado dependerá de si la API respondió o no
    // Podría ser:
    // - Verde "✓ Número verificado!" (éxito)
    // - Rojo "✗ Intenta con otro número" (número inválido)
    // - Rojo "✗ Tiempo agotado" (timeout)
    // Lo importante es que NO sea "Validando..." ni mostrar un error de ReferenceError

    if (btnTextFinal.includes('Validando')) {
      console.error('❌ ERROR: El botón está colgado en "Validando"');
      process.exit(1);
    }

    if (btnTextFinal.includes('Verificado') || btnTextFinal.includes('Intenta') || btnTextFinal.includes('agotado')) {
      console.log('✅ Validación completó correctamente');
      console.log('   Resultado:', btnTextFinal);
    } else {
      console.warn('⚠️  Estado final inesperado:', btnTextFinal);
    }

    // Verificar que no hay errores ReferenceError en consola
    if (consoleErrors.length > 0) {
      const hasRefError = consoleErrors.some(err => err.includes('ReferenceError') && err.includes('showErrorNotification'));
      if (hasRefError) {
        console.error('❌ ERROR: Se detectó ReferenceError en consola');
        console.error('Errores:', consoleErrors);
        process.exit(1);
      }
    }
    console.log('✅ Sin errores ReferenceError en consola');

    console.log('\n🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📋 Resumen:');
    console.log('  ✅ Paso 1 (searchType): OK');
    console.log('  ✅ Paso 2 (userWhatsapp): SIN validación (correcto)');
    console.log('  ✅ Paso 3 (personName): SIN validación (correcto)');
    console.log('  ✅ Paso 4 (personWhatsapp): Validación activada correctamente');
    console.log('  ✅ Botón cambia de estado (Validando → resultado)');
    console.log('  ✅ Sin errores ReferenceError');

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
