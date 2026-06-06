/**
 * Script de verificación simple del quiz
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
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Capturar errores de consola
    const consoleErrors = [];
    page.on('console', msg => {
      const type = msg.type();
      console.log(`[${type}]`, msg.text());
      if (type === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navegar al quiz
    const filePath = 'file:///c:/Users/JOHN/Desktop/JohnJairo/ArtificialCtrl/plin/rosa/saveweb2zip-com-plin-com-br/index.html';
    console.log('📖 Abriendo quiz...');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    await wait(2000);

    // Obtener información de la página
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        quizInlineExists: !!document.getElementById('plin-quiz-inline'),
        pricingExists: !!document.getElementById('pricing'),
        allElements: document.body.innerHTML.substring(0, 500)
      };
    });

    console.log('Page info:', pageContent);

    // Buscar el contenedor del quiz
    const quizContainer = await page.evaluate(() => {
      const el = document.getElementById('plin-quiz-inline');
      if (el) {
        return { found: true, html: el.innerHTML.substring(0, 200) };
      }
      const pricing = document.getElementById('pricing');
      if (pricing) {
        return { found: false, inPricing: true, html: pricing.innerHTML.substring(0, 200) };
      }
      return { found: false, inPricing: false };
    });

    console.log('Quiz container:', quizContainer);

    // Verificar que setButtonState esté definida
    const hasSetButtonState = await page.evaluate(() => {
      return typeof window.setButtonState !== 'undefined';
    });

    console.log('setButtonState disponible globalmente:', hasSetButtonState);

    // Ejecutar un test simple del quiz
    const quizTest = await page.evaluate(() => {
      // Buscar la función en el IIFE
      const scripts = document.querySelectorAll('script:not([src])');
      let found = false;
      for (let script of scripts) {
        if (script.textContent.includes('setButtonState')) {
          found = true;
          break;
        }
      }
      return { quizScriptFound: found };
    });

    console.log('Quiz script found:', quizTest);

    // Hacer clic en el quiz para iniciar
    const quizStarted = await page.evaluate(() => {
      const containers = document.querySelectorAll('[id*="quiz"], [class*="quiz"]');
      return {
        found: containers.length,
        ids: Array.from(containers).map(el => el.id || el.className).slice(0, 5)
      };
    });

    console.log('Quiz elements found:', quizStarted);

    // Buscar botones del quiz
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns)
        .filter(btn => btn.textContent.includes('Continuar') || btn.textContent.includes('Hombre') || btn.textContent.includes('Mujer'))
        .map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled
        }))
        .slice(0, 5);
    });

    console.log('Quiz buttons found:', buttons);

    if (buttons.length > 0) {
      console.log('\n✅ Quiz está renderizado. Iniciando test...');

      // Hacer clic en la primera opción (Mujer)
      await page.click('button[data-value="mujer"]');
      await wait(300);
      console.log('✅ Seleccionada opción "Mujer"');

      // Hacer clic en continuar
      await page.click('.plin-quiz-btn-continue');
      await wait(500);
      console.log('✅ Hecho clic en Continuar');

      // Esperar a que aparezca el input
      await page.waitForSelector('#plin-quiz-input', { timeout: 5000 });
      console.log('✅ Input del quiz visible');

      // Rellenar el número del usuario (paso 2)
      const input = await page.$('#plin-quiz-input');
      await input.type('+52 555-123-4567');
      console.log('✅ Ingresado número del usuario');

      // Hacer clic en continuar (no debería validar)
      await page.click('.plin-quiz-btn-continue');
      await wait(300);
      console.log('✅ Continuando a paso 3');

      // Paso 3: nombre
      const input2 = await page.$('#plin-quiz-input');
      await input2.type('Juan García');
      console.log('✅ Ingresado nombre');

      await page.click('.plin-quiz-btn-continue');
      await wait(300);
      console.log('✅ Continuando a paso 4 (validación)');

      // Paso 4: personWhatsapp (ESTE SÍ se valida)
      const input3 = await page.$('#plin-quiz-input');
      await input3.type('+52 555-987-6543');
      console.log('✅ Ingresado número de la persona');

      // Hacer clic para validar
      const btnBefore = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
      console.log('Botón antes:', btnBefore);

      await page.click('.plin-quiz-btn-continue');
      await wait(500);

      const btnValidating = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
      console.log('Botón mientras valida:', btnValidating);

      if (btnValidating.includes('Validando')) {
        console.log('✅ Botón cambió a "Validando número..."');
      } else {
        console.warn('⚠️ Botón no cambió a validando:', btnValidating);
      }

      // Esperar a que se complete
      await wait(6000);

      const btnFinal = await page.$eval('.plin-quiz-btn-continue', btn => btn.textContent);
      console.log('Botón final:', btnFinal);

      if (btnFinal.includes('Verificado') || btnFinal.includes('Intenta') || btnFinal.includes('agotado')) {
        console.log('✅ Validación completó');
      } else if (btnFinal.includes('Validando')) {
        console.error('❌ FALLO: Botón colgado en validando');
        process.exit(1);
      }
    }

    // Verificar errores ReferenceError
    const refErrors = consoleErrors.filter(err => err.includes('ReferenceError'));
    if (refErrors.length > 0) {
      console.error('\n❌ FALLO: Errores ReferenceError detectados:');
      refErrors.forEach(err => console.error('  -', err));
      process.exit(1);
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
