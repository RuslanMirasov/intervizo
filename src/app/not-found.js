import { Section, Button, Flex } from '@/components';

export const metadata = {
  title: 'InterVizo | Page Not Found',
  description: "This page doesn't exist.",
};

const NotFound = () => {
  return (
    <Section width="200px">
      <Flex>
        <h1>Ошибка 404</h1>
        <p>Страница не найдена</p>
        <Button href="./" className="small border">
          На главную
        </Button>
      </Flex>
    </Section>
  );
};

export default NotFound;
