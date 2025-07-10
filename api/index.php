<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header('Access-Control-Allow-Methods: POST, GET, PATCH, DELETE');
header("Allow: GET, POST, PATCH, DELETE");

date_default_timezone_set('America/Argentina/Buenos_Aires');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
   return 0;    
}  

spl_autoload_register(
    function ($nombre_clase) {
        include __DIR__.'/'.str_replace('\\', '/', $nombre_clase) . '.php';
    }
);

define('JWT_KEY', 'DayR7RxvEM4T4efkoEZBSVDjVqrmtdaQZHepj-D4L43GB7mzywkDtr7K-LpjvfKdRRGEqIcvYAPBjCVXñ.');
define('JWT_ALG', 'HS256');
define('JWT_EXP', 600); // segundos


use \Firebase\JWT\JWT;

$metodo = strtolower($_SERVER['REQUEST_METHOD']);
$comandos = explode('/', strtolower($_GET['comando']));
$funcionNombre = $metodo.ucfirst($comandos[0]);

$parametros = array_slice($comandos, 1);
if (count($parametros) >0 && $metodo == 'get') {
    $funcionNombre = $funcionNombre.'ConParametros';
}

if (function_exists($funcionNombre)) {
    call_user_func_array($funcionNombre, $parametros);
} else {
    header(' ', true, 400);
}


function output($val, $headerStatus = 200)
{
    header(' ', true, $headerStatus);
    header('Content-Type: application/json');
    print json_encode($val);
    die;
}

function outputError($codigo = 500)
{
    switch ($codigo) {
        case 400:
            header($_SERVER["SERVER_PROTOCOL"] . " 400 Bad request", true, 400);
            die;
        case 401:
            header($_SERVER["SERVER_PROTOCOL"] . " 401 Unauthorized", true, 401);
            die;
        case 404:
            header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found", true, 404);
            die;
        case 409:  
            header($_SERVER["SERVER_PROTOCOL"] . " 409 Conflict", true, 409);
            die;
        default:
            header($_SERVER["SERVER_PROTOCOL"] . " 500 Internal Server Error", true, 500);
            die;
            break;
    }
}

function inicializarBBDD()
{
    return $bd = new SQLite3(__DIR__ . '/../../adicional/mercadobyte.db');
}

/*function postRestablecer()
{
    $bd = inicializarBBDD();
    $sql = file_get_contents(__DIR__ . '/../../adicional/dump.sql');
    $result = $bd->exec($sql);
    outputJson([]);
}*/

function autenticar($usuario, $clave)
{
    $bd = inicializarBBDD();
    $result = $bd->query("SELECT u.id_usuario as id, u.nombre as nombre, u.id_rol as id_rol, r.nombre as nombre_rol  from usuario u inner join rol r on u.id_rol = r.id_rol where email='$usuario' and password='$clave'");
    $ret = [];

    $fila = $result->fetchArray(SQLITE3_ASSOC);

    if (!empty($fila))
    {
        return $fila;
    }
    return false;
}


function requiereLogin()
{
    try {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            throw new Exception("Token requerido", 1);
        }
        list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
        $decoded = JWT::decode($jwt, JWT_KEY, [JWT_ALG]);
    } catch(Exception $e) {
        outputError(401);
    }
    return $decoded;
}

/*function getPrivado()
{
    $payload = requiereLogin();
    output(['data' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']);
}

function getPerfil()
{
    $payload = requiereLogin();
    output(['id' => $payload->uid, 'nombre' => $payload->nombre]);
}
*/

function getMenuConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select titulo as titulo, accion as accion from menu where id_rol = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getPublicaciones()
{
    $bd = inicializarBBDD();
    $result = $bd->query("select c.id_categoria as id_categoria, c.nombre_categoria as categoria, group_concat('{\"id_publicacion\": ' || pu.id_publicacion || ', \"modelo\": \"' || p.nombre || '\", \"precio\": ' || pu.costo || ', \"ruta_imagen\": \"' || pu.ruta_imagen || '\"}', '##') as productos from publicacion pu inner join producto p on pu.ID_PRODUCTO = p.ID_PRODUCTO inner join categoria c on p.id_categoria = c.ID_CATEGORIA where pu.activa = 1 and pu.stock > 0
group by nombre_categoria");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        
        $productos_raw = explode('##', $fila['productos']);
        $productos = array_map(function($producto) {
            return json_decode($producto, true); // Convertir cada string JSON en un array asociativo
        }, $productos_raw);

        if (count($productos) > 0 && $productos[0]===null)
        {
            // Crear la estructura final
            $ret[] = [
                'categoria' => $fila['categoria'],
                'id_categoria' => $fila['id_categoria'],
                'productos' => null
            ];    
        } else {
            // Crear la estructura final
            $ret[] = [
                'categoria' => $fila['categoria'],
                'id_categoria' => $fila['id_categoria'],
                'productos' => $productos
            ];
        }

        
    }
    output($ret);
}





function getMisdatosConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select id_usuario as id, nombre || ' ' || apellido as nombre, dni as dni, email as email, domicilio as domicilio, id_localidad as id_localidad, password as password from usuario where id_usuario = $id");
    $fila = $result->fetchArray(SQLITE3_ASSOC);
    output($fila);
}

function getPublicacionConParametros($id)
{
    $bd = inicializarBBDD();
    $result = $bd->query("select pr.nombre as producto_nombre, pr.ean as ean, max(pub.costo) as precio, max(pub.stock) as stock, max(pub.breve_descripcion) as descripcion, max(pub.ruta_imagen) as img, pub.activa as activa, op.opiniones, pyr.preg_resp as preguntas_respuestas
 from publicacion pub inner join producto pr on pub.id_producto = pr.id_producto 
                     left join (select v.id_publicacion, group_concat('{\"id_opinion\":' || o.id_opinion || ', \"puntaje\": ' || o.puntaje || ', \"comentario\": \"' || case when o.comentario is null or o.comentario ='' then '' else o.comentario end || '\"}', '##') as opiniones
                                         from venta v inner join opinion o on v.id_venta = o.id_venta group by v.id_publicacion) op on op.id_publicacion = pub.id_publicacion 
                     left join (select id_publicacion, group_concat('{\"id_cliente\": ' || id_cliente || ', \"pregunta\": \"' || pregunta || '\" , \"fecha_pregunta\": \"' || fecha_pregunta || '\", \"respuesta\": ' || case when respuesta is null then 'null' else '\"' || respuesta || '\"' end || ', \"fecha_respuesta\": ' || case when fecha_respuesta is null then 'null' else '\"' || fecha_respuesta || '\"' end || '}','##') preg_resp
                                 from pregunta_respuesta pyr group by id_publicacion) pyr on pyr.id_publicacion = pub.id_publicacion
 where pub.id_publicacion = $id group by pub.id_publicacion, pr.nombre");
        
        $fila = $result->fetchArray(SQLITE3_ASSOC);
        
        $productos_raw = explode('##', $fila['opiniones']);
        $productos = array_map(function($producto) {
            return json_decode($producto, true); // Convertir cada string JSON en un array asociativo
        }, $productos_raw);


        if (count($productos) > 0 && $productos[0]===null)
        {
            $fila['opiniones'] = null;    
        } else {
            $fila['opiniones'] = $productos;
        }


        $pregyresp_raw = explode('##', $fila['preguntas_respuestas']);
        $pregyresps = array_map(function($pregyresp) {
            return json_decode($pregyresp, true); // Convertir cada string JSON en un array asociativo
        }, $pregyresp_raw);

        if (count($pregyresps) > 0 && $pregyresps[0]===null)
        {
            $fila['preguntas_respuestas'] = null;    
        } else {
            $fila['preguntas_respuestas'] = $pregyresps;
        }
        

    output($fila);

}

function getLocalidades()
{
    $bd = inicializarBBDD();
    $result = $bd->query("select 0 as id_localidad, ' Seleccione una opcion..' as nombre_localidad union 
                        select id_localidad as id_localidad, nombre as nombre_localidad from localidad");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getCategorias()
{
    $bd = inicializarBBDD();
    $result = $bd->query("select id_categoria as id, nombre_categoria as categoria from categoria");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getProductosConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select id_producto as id, nombre as nombre, ean as ean, id_categoria as id_categoria from producto where id_categoria = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function patchOpinion($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $comentario = $bd->escapeString($datos['comentario']);
    $puntaje = $datos['puntaje']+0;


    $result = @$bd->exec("UPDATE opinion SET puntaje=$puntaje, comentario='$comentario' WHERE id_venta=$id");
    output(['id' => $id]);
}

function patchRespuesta($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $respuesta = $bd->escapeString($datos['respuesta']);
    $fecha_respuesta = date('Y-m-d');


    $result = @$bd->exec("UPDATE pregunta_respuesta SET respuesta='$respuesta', fecha_respuesta='$fecha_respuesta' WHERE id_pregunta_respuesta=$id");
    output(['id' => $id]);
}

function patchUsuario($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $domicilio = $bd->escapeString($datos['domicilio']);
    $localidad = $datos['id_localidad']+0;
    $password = $bd->escapeString($datos['password']);

    $result = @$bd->exec("UPDATE usuario SET domicilio='$domicilio', id_localidad=$localidad, password='$password' WHERE id_usuario=$id");
    output(['id' => $id]);
}

function patchProducto($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $bd->escapeString($datos['nombre']);
    $ean = $bd->escapeString($datos['ean']);
    $categoria = $datos['id_categoria']+0;

    //chequeamos si se puede agregar
    $result = $bd->query("SELECT 1 FROM producto WHERE ean = '$ean' and id_producto <> $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existe un producto para ese ean, no se puede insertar.
        outputError(409);
    } else {
        // No existe ningun producto con ese ean, se puede actualizar.
        $result = @$bd->exec("UPDATE producto SET nombre='$nombre', id_categoria=$categoria, ean='$ean' WHERE id_producto=$id");
        output(['id' => $id]);
    }  

    
}

function patchCategoria($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $bd->escapeString($datos['categoria']);

    //chequeamos si se puede agregar
    $result = $bd->query("SELECT 1 FROM categoria WHERE nombre_categoria = '$nombre' and id_categoria <> $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existe una categoria con el mismo nombre
        outputError(409);
    } else {
        // No existe ninguna categoria
        $result = @$bd->exec("UPDATE categoria SET nombre_categoria='$nombre' WHERE id_categoria=$id");
        output(['id' => $id]);
    }  

    
}


function patchestadoVenta($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    
    $fecha = date('Y-m-d');

    
        $result = @$bd->exec("update venta set id_estado = (select id_estado from estado where descripcion = 'Finalizado'), fecha_entrega = '$fecha' where id_venta = $id");
        
        if ($result) {
        output([]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
      
}

function patchPublicacion()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $publicacion = $datos['id_publicacion']+0;
    $nuevoEstado = $datos['nuevo_estado']+0;


    
        $result = @$bd->exec("update publicacion set activa = $nuevoEstado where id_publicacion = $publicacion");
        
        if ($result) {
        output([]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
      
}

function patchEditpublicacion($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $descripcion = $bd->escapeString($datos['descripcion']);
    $stock = $datos['stock']+0;
    $total = $datos['total']+0;
    $nuevaimgnomb = $bd->escapeString($datos['imgnombre']);
    $imgbase64 = $datos['imgbase64'];

    // Construir consulta SQL
    $sql = "UPDATE publicacion SET breve_descripcion = '$descripcion', stock = $stock, costo = $total";

    if($nuevaimgnomb != null)
    {
    $archivo = base64_decode($imgbase64);
    
    $filePath =  __DIR__ . '\..\assets\img\\'  .date('ymdHis')."_". $nuevaimgnomb;

        if(!file_put_contents($filePath, $archivo))
        {
            outputError(500);
        }

        // si tiene img para actualizar y se inserto correctamente, se suma a la consulta
        $rutaImagen = "assets/img/" .date('ymdHis')."_". $nuevaimgnomb;
        $sql .= ", ruta_imagen = '$rutaImagen'";

    }

    // completar consulta
    $sql .= " WHERE id_publicacion = $id";
    
    
        $result = @$bd->exec($sql);
        
        if ($result) {
        output([]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
      
}

function postOpinion()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $comentario = $bd->escapeString($datos['comentario']);
    $puntaje = $datos['puntaje']+0;
    $id_venta = $datos['id_venta']+0;


        $result = @$bd->exec("insert into opinion (id_venta, puntaje, comentario) values ($id_venta, $puntaje, '$comentario')");
         if ($result) {
        // Obtener el último ID insertado
        $ultimoId = $bd->lastInsertRowID();

        // Devolver el ID en la respuesta
        output(['id' => $ultimoId]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
  
}

function patchLogout()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id_usuario = $datos['id_usuario']+0;


        $result = @$bd->exec("update usuario set token = null where id_usuario = $id_usuario");

        output([]);

  
}


function postBuscador()
{


    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $texto = $bd->escapeString($datos['texto']);

    $result = $bd->query("select pu.id_publicacion as id_publicacion, p.nombre as modelo, pu.costo as precio, pu.ruta_imagen as ruta_imagen from publicacion pu inner join producto p on pu.ID_PRODUCTO = p.ID_PRODUCTO where pu.activa = 1 and pu.stock > 0 and p.nombre like '%$texto%'");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
         $dato = ["id_publicacion" => $fila['id_publicacion'],
                    "modelo" => $fila['modelo'],
                    "precio" => $fila['precio'],
                    "ruta_imagen" => $fila['ruta_imagen']
                ];
        $ret[] = $dato; 
    }
    output($ret);

}

function postPregunta()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $pregunta = $bd->escapeString($datos['pregunta']);
    $id_publicacion = $datos['id_publicacion']+0;
    $id_cliente = $datos['id_cliente']+0;
    $fecha_pregunta = date('Y-m-d');


        $result = @$bd->exec("insert into pregunta_respuesta (id_publicacion, id_cliente, pregunta, fecha_pregunta) values ($id_publicacion, $id_cliente, '$pregunta', '$fecha_pregunta')");
         if ($result) {
        // Obtener el último ID insertado
        $ultimoId = $bd->lastInsertRowID();

        // Devolver el ID en la respuesta
        output(['id' => $ultimoId]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
  
}

function postProducto()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $bd->escapeString($datos['nombre']);
    $ean = $bd->escapeString($datos['ean']);
    $categoria = $datos['id_categoria']+0;

    //chequeamos si se puede agregar
    $result = $bd->query("SELECT 1 FROM producto WHERE ean = '$ean'");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existe un producto para ese ean, no se puede insertar.
        outputError(401);
    } else {
        // No existe ningun producto con ese ean, se puede insertar.
        $result = @$bd->exec("insert into producto (nombre, ean, id_categoria) values ('$nombre', '$ean', $categoria)");
        output([]);
    }  
}

function postPublicacion()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    

    $desc = $bd->escapeString($datos['descripcion']);
    $id_producto = $datos['id_producto']+0;
    $id_vendedor = $datos['id_usuario']+0;
    $stock = $datos['stock']+0;
    $total = $datos['total']+0;
    $nuevaimgnomb = $bd->escapeString($datos['imgnombre']);
    $imgbase64 = $datos['imgbase64'];

    // Construir consulta SQL
    $sql = "insert into publicacion (id_producto, id_vendedor, breve_descripcion, stock, costo, activa)  values ($id_producto,$id_vendedor,'$desc',$stock,$total,1)";

    if($nuevaimgnomb != null)
    {
    $archivo = base64_decode($imgbase64);
    
    $filePath =  __DIR__ . '\..\assets\img\\' .date('ymdHis')."_". $nuevaimgnomb;

        if(!file_put_contents($filePath, $archivo))
        {
            outputError(500);
        }

        // si tiene img para actualizar y se inserto correctamente, se suma a la consulta
        $rutaImagen = "assets/img/" .date('ymdHis')."_". $nuevaimgnomb;
        $sql = "insert into publicacion (id_producto, id_vendedor, breve_descripcion, stock, costo, activa, ruta_imagen)  values ($id_producto,$id_vendedor,'$desc',$stock,$total,1, '$rutaImagen')";

    }
    
        $result = @$bd->exec($sql);
        
    if ($result) {
        // Obtener el último ID insertado
        $ultimoId = $bd->lastInsertRowID();

        // Devolver el ID en la respuesta
        output(['id' => $ultimoId]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
 
}


function postCompra()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $fecha = $bd->escapeString($datos['fecha_venta']);
    $nro_venta = $bd->escapeString($datos['nro_venta']);
    $publicacion = $datos['id_publicacion']+0;
    $comprador = $datos['id_comprador']+0;
    $cant = $datos['cantidad']+0;
    $costo = $datos['costo']+0;

    
        $result = @$bd->exec("insert into venta (nro_venta, fecha_pedido, id_cliente, id_publicacion, cantidad, costo, id_estado) select '$nro_venta' as nro_venta, '$fecha' as fecha_pedido, $comprador as id_cliente, $publicacion as id_publicacion, $cant as cantidad, $costo as costo, e.id_estado as id_estado from estado e where e.descripcion = 'Pendiente'");
        
        if ($result) {
        // Obtener el último ID insertado
        $ultimoId = $bd->lastInsertRowID();

        //lo tenemos, nos falta modificar el stock de la publicacion
        $result = @$bd->exec("update publicacion set stock = stock - $cant where id_publicacion = $publicacion");

        // Devolver el ID en la respuesta
        output(['id' => $ultimoId]);
    } else {
        // Manejar errores si no se insertó nada
        outputError(400);
    }
      
}

function postCategoria()
{
    $bd = inicializarBBDD();
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $bd->escapeString($datos['categoria']);
    
    //chequeamos si se puede agregar
    $result = $bd->query("SELECT 1 FROM categoria WHERE nombre_categoria = '$nombre'");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existe una categoria
        outputError(401);
    } else {
        // No existe ninguna categoria
        $result = @$bd->exec("insert into categoria (nombre_categoria) values ('$nombre')");
        output([]);
    }  
}

function deleteProducto($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();

    //chequeamos si se puede borrar (si tiene publicaciones asociadas)
    $result = $bd->query("SELECT 1 FROM publicacion WHERE id_producto = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existen publicaciones asociadas, no permitir borrar el producto
        outputError(409);
    } else {
        // No existen publicaciones, se puede proceder con el borrado
        $result = @$bd->exec("DELETE FROM producto WHERE id_producto = $id");
        output(['id' => $id]);
    }

    
}

function deleteCategoria($id)
{
    settype($id, 'integer');
    $bd = inicializarBBDD();

    //chequeamos si se puede borrar 
    $result = $bd->query("SELECT 1 FROM producto WHERE id_categoria = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila;
    }

    if (count($ret) > 0) {
        // Existen productos asociados
        outputError(409);
    } else {
        // No existen productos
        $result = @$bd->exec("DELETE FROM categoria WHERE id_categoria = $id");
        output(['id' => $id]);
    }

    
}

function getComprasConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select p.id_publicacion as id_publicacion, v.id_venta as id_venta, nro_venta as nro_venta, cantidad as cant, v.costo as total, pr.nombre as producto, (v.costo / cantidad) as costo, e.descripcion as estado, p.ruta_imagen as img, o.id_opinion as id_opinion, o.puntaje as puntaje, o.comentario as comentario
from venta v inner join publicacion p on v.id_publicacion = p.id_publicacion inner join producto pr on p.id_producto = pr.id_producto inner join estado e on e.id_estado = v.id_estado 
left join opinion o on o.id_venta = v.id_venta where id_cliente = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getMispreguntasConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select pr.id_pregunta_respuesta as id,pr.id_publicacion as id_publicacion, p.nombre as nombre_producto, pub.ruta_imagen as imagen, pr.pregunta as pregunta, pr.fecha_pregunta as fecha_pregunta, pr.respuesta as respuesta, pr.fecha_respuesta as fecha_respuesta
from pregunta_respuesta pr inner join publicacion pub on pr.id_publicacion = pub.id_publicacion inner join producto p on p.id_producto = pub.id_producto where pr.id_cliente = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getMispreguntasvendConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select pr.id_pregunta_respuesta as id, pr.id_publicacion as id_publicacion, p.nombre as nombre_producto, pub.ruta_imagen as imagen, pr.pregunta as pregunta, pr.fecha_pregunta as fecha_pregunta, pr.respuesta as respuesta, pr.fecha_respuesta as fecha_respuesta
from pregunta_respuesta pr inner join publicacion pub on pr.id_publicacion = pub.id_publicacion inner join producto p on p.id_producto = pub.id_producto where pub.id_vendedor = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getOpinionConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select id_venta as id_venta, puntaje as puntaje, comentario as comentario from opinion where id_venta = $id");
    
    $fila = $result->fetchArray(SQLITE3_ASSOC);

    if ($fila){
    output($fila);    
    }
    output(null);
}

function getTokenConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select token as token from usuario where id_usuario = $id");
    
    $fila = $result->fetchArray(SQLITE3_ASSOC);

    output($fila);    

}

function getVentasConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select p.id_publicacion as id_publicacion, id_venta as id_venta, nro_venta as nro_venta, cantidad as cant, v.costo as total, pr.nombre as producto, p.costo as costo, e.descripcion as estado, p.ruta_imagen as img, v.id_estado as id_estado, v.fecha_entrega as fecha_entrega from venta v inner join publicacion p on v.id_publicacion = p.id_publicacion inner join producto pr on p.id_producto = pr.id_producto inner join estado e on e.id_estado = v.id_estado  where id_vendedor = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}

function getPublicacionesConParametros($id)
{
    $bd = inicializarBBDD();
    settype($id, 'integer');
    $result = $bd->query("select id_publicacion as id, pr.nombre as titulo, stock as stock, costo as total, nombre_categoria as categoria, p.ruta_imagen as img, p.activa as activa, p.breve_descripcion as descripcion, c.id_categoria as id_categoria, pr.id_producto as id_producto from publicacion p inner join producto pr on p.id_producto = pr.id_producto inner join categoria c on pr.id_categoria = c.id_categoria where id_vendedor = $id");
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        $ret[] = $fila; 
    }
    output($ret);
}
function postLogin()
{
    $loginData = json_decode(file_get_contents("php://input"), true);
    $logged = autenticar($loginData['email'], $loginData['clave']);

    if ($logged===false) {
        outputError(401);
    }
    //output($logged);
    $payload = [
        'id'       => $logged['id'],
        'nombre'    => $logged['nombre'],
        'id_rol'    => $logged['id_rol'],
        'rol'       => $logged['nombre_rol'],
        'exp'       => time() + JWT_EXP,
    ];
    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
    
    insertarLogin($jwt, $logged['id']);

    output(['jwt'=>$jwt]);

    
}

function insertarLogin($jwt, $id_usuario) {

    $bd = inicializarBBDD();
    settype($id_usuario, 'integer');
    
    
        $result = @$bd->exec("update usuario set token = '$jwt' where id_usuario = $id_usuario");
}

function postRefresh()
{
    $payload = requiereLogin();
    $payload->exp = time() + JWT_EXP;
    $jwt = JWT::encode($payload, JWT_KEY);
    output(['jwt'=>$jwt]);
}
