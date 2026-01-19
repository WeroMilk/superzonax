// Script para probar la conexión a Supabase
// Ejecuta con: node scripts/test-connection.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sujqmrkupfhkfgptkvxd.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando conexión a Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceRoleKey ? `${supabaseServiceRoleKey.substring(0, 20)}...` : 'NO CONFIGURADA');

if (!supabaseServiceRoleKey || supabaseServiceRoleKey.includes('placeholder')) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local');
  console.log('\n📝 Necesitas crear un archivo .env.local con:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://sujqmrkupfhkfgptkvxd.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  try {
    console.log('\n📡 Probando conexión...\n');
    
    // Probar consulta a usuarios
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error al consultar usuarios:', usersError.message);
      console.error('Código:', usersError.code);
      return false;
    }
    
    console.log('✅ Conexión exitosa!');
    console.log(`\n👥 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    
    // Probar otras tablas
    const tables = ['attendance', 'consejo_tecnico', 'reporte_trimestral', 'events'];
    console.log('\n📊 Verificando otras tablas...');
    
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 ¡Todo está funcionando correctamente!');
  } else {
    console.log('\n💡 Revisa la configuración en .env.local');
  }
  process.exit(success ? 0 : 1);
});
