
// Define el tipo para un resultado exitoso.
type Success<T> = {
  data: T;                                                      // Contiene los datos si la operación fue exitosa.
  error: null;                                                  // El error es nulo en caso de éxito.
};

// Define el tipo para un resultado fallido.
type Failure<E> = {
  data: null;                                                   // Los datos son nulos en caso de fallo.
  error: E;                                                     // Contiene el error si la operación falló.
};

// Unión discriminada que representa un resultado que puede ser exitoso o fallido.
// TypeScript puede diferenciar entre `Success` y `Failure` basándose en la propiedad `error`.
type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Envuelve una promesa en un bloque try-catch para manejar errores de forma predecible.
 * En lugar de lanzar una excepción, siempre devuelve un objeto `Result`.
 * @param promise La promesa que se va a ejecutar.
 * @returns Un objeto `Result` que contiene `data` en caso de éxito o `error` en caso de fallo.
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    // Intenta resolver la promesa.
    const data = await promise;
    // Si tiene éxito, devuelve un objeto `Success`.
    return { data, error: null }; 
  } catch (error) {
    // Si la promesa es rechazada, captura el error y devuelve un objeto `Failure`.
    return { data: null, error: error as E }; 
  }
}