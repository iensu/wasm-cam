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
}

impl PartialEq for Pixel {
    fn eq(&self, other: &Self) -> bool {
        self.index == other.index && self.color == other.color
    }
}

pub type PixelSquare = Vec<Pixel>;
