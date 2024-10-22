import generateImageModel1 from '../aimodels/model1.js';
import generateImageModel2 from '../aimodels/model2.js';
import generateImageModel3 from '../aimodels/model3.js';
import generateImageModel4 from '../aimodels/model4.js';

const handleModelRequest = async (req, res) => {
    const { contents, selectedItem } = req.body;

    switch (selectedItem) {
        case '1':
            const imageUrl1 = await generateImageModel1(contents);
            return res.status(200).json({ imageUrl: imageUrl1 });
        case '2':
            const imageUrl2 = await generateImageModel2(contents);
            return res.status(200).json({ imageUrl: imageUrl2 });
        case '3':
            const imageUrl3 = await generateImageModel3(contents);
            return res.status(200).json({ imageUrl: imageUrl3 });
        case '4':
            const imageUrl4 = await generateImageModel4(contents);
            return res.status(200).json({ imageUrl: imageUrl4 });
        default:
            return res.status(400).json({ message: '잘못된 선택입니다.' });
    }
};

export default handleModelRequest;  // default export로 변경

