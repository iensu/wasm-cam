pub type PixelColor = (u8, u8, u8, u8);

#[derive(Debug, Eq, Copy, Clone)]
pub struct Pixel {
    pub index: usize,
    pub color: PixelColor,
}

impl Pixel {
    pub fn new(index: usize, image_data: &Vec<u8>) -> Pixel {
        Pixel {
            index,
            color: (
                image_data[index + 0],
                image_data[index + 1],
                image_data[index + 2],
                image_data[index + 3],
            ),
        }
    }

    pub fn color_strength(&self) -> u32 {
        let (r, g, b, _) = self.color;
        u32::from(r) + u32::from(g) + u32::from(b)
    }
}

impl PartialEq for Pixel {
    fn eq(&self, other: &Self) -> bool {
        self.index == other.index && self.color == other.color
    }
}

pub type PixelSquare = Vec<Pixel>;
