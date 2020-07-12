mod pixel;
mod transforms;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum Transformation {
    Pixelate,
    Greyscale,
    Unknown,
}

#[wasm_bindgen]
pub fn transform(
    input: Vec<u8>,
    width: u32,
    height: u32,
    square_size: u32,
    transform: Transformation,
) -> Vec<u8> {
    let transform_fn = match transform {
        Transformation::Pixelate => transforms::color_average,
        Transformation::Greyscale => transforms::average,
        _ => transforms::identity,
    };

    transforms::apply_transform(input, width, height, square_size, transform_fn)
}
