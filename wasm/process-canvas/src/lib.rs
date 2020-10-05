mod pixel;
mod transforms;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, ImageData};

#[wasm_bindgen]
pub enum Transformation {
    Pixelate,
    Greyscale,
    Unknown,
}

#[wasm_bindgen]
pub fn transform(
    source: &CanvasRenderingContext2d,
    output: &CanvasRenderingContext2d,
    width: u32,
    height: u32,
    square_size: u32,
    transform: Transformation,
) -> Result<(), JsValue> {
    let transform_fn = match transform {
        Transformation::Pixelate => transforms::color_average,
        Transformation::Greyscale => transforms::average,
        _ => transforms::identity,
    };

    let source_data = source
        .get_image_data(0.0, 0.0, width.into(), height.into())?
        .data();

    let mut output_data =
        transforms::apply_transform(&source_data, width, height, square_size, transform_fn);

    let output_image_data =
        ImageData::new_with_u8_clamped_array_and_sh(Clamped(&mut output_data), width, height)?;

    output.put_image_data(&output_image_data, 0.0, 0.0)
}
