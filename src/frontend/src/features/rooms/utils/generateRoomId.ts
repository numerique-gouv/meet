
const getRandomChar = () => {
  // Google Meet uses only letters in a room identifier
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  return characters.charAt(Math.floor(Math.random() * charactersLength))
}

const generateSegment = (length: number): string => {
  let segment = '';
  for (let i = 0; i < length; i++) {
    segment += getRandomChar();
  }
  return segment;
};

export const generateRoomId = () => {
  // Generates a unique room identifier following the Google Meet format
  const shortLength = 3;
  const longLength = 4;
  const parts = [
    generateSegment(shortLength),
    generateSegment(longLength),
    generateSegment(shortLength)
  ];
  return parts.join('-');
}

export const roomIdRegex = /^[/](?<roomId>[a-z]{3}-[a-z]{4}-[a-z]{3})$/;

