#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct RgbaColor(pub u8, pub u8, pub u8, pub u8);

#[derive(Debug, PartialEq, Eq, Copy, Clone)]
pub struct Pixel {
    pub index: usize,
    pub color: RgbaColor,
}

impl Pixel {
    pub fn new(index: usize, image_data: &Vec<u8>) -> Pixel {
        Pixel {
            index,
            color: RgbaColor(
                image_data[index + 0],
                image_data[index + 1],
                image_data[index + 2],
                image_data[index + 3],
            ),
        }
    }

    pub fn color_strength(&self) -> u32 {
        let RgbaColor(r, g, b, _) = self.color;
        u32::from(r) + u32::from(g) + u32::from(b)
    }
}

pub type PixelSquare = Vec<Pixel>;
