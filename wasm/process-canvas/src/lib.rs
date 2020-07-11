mod pixel;
mod transforms;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum Transform {
    Pixelate,
    Greyscale,
}

#[wasm_bindgen]
pub fn transform(
    input: Vec<u8>,
    width: u32,
    height: u32,
    square_size: u32,
    transform: Transform,
) -> Vec<u8> {
    let transform_fn = match transform {
        Transform::Pixelate => transforms::color_average,
        Transform::Greyscale => transforms::average,
    };

    transforms::apply_transform(input, width, height, square_size, transform_fn)
}
