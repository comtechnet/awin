import { Container, Col, Button, Row, FloatingLabel, Form } from 'react-bootstrap';
import classes from './Playground.module.css';
import React, { useEffect, useState } from 'react';
import Link from '../../components/Link';
import { ImageData, getNounData, getRandomawineed } from '@awin/assets';
import { buildSVG } from '@awin/sdk';
import Noun from '../../components/Noun';
import NounModal from './NounModal';

interface Trait {
  title: string;
  traitNames: string[];
}

const awinProtocolLink = (
  <Link
    text="awin Protocol"
    url="https://www.notion.so/Noun-Protocol-32e4f0bf74fe433e927e2ea35e52a507"
    leavesPage={true}
  />
);

const awinAssetsLink = (
  <Link
    text="awin-assets"
    url="https://github.com/awinDAO/awin-monorepo/tree/master/packages/awin-assets"
    leavesPage={true}
  />
);

const awinSDKLink = (
  <Link
    text="awin-sdk"
    url="https://github.com/awinDAO/awin-monorepo/tree/master/packages/awin-sdk"
    leavesPage={true}
  />
);

const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1));

const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const Playground: React.FC = () => {
  const [awinvgs, setawinvgs] = useState<string[]>();
  const [traits, setTraits] = useState<Trait[]>();
  const [modSeed, setModSeed] = useState<{ [key: string]: number }>();
  const [initLoad, setInitLoad] = useState<boolean>(true);
  const [displayNoun, setDisplayNoun] = useState<boolean>(false);
  const [indexOfNounToDisplay, setIndexOfNounToDisplay] = useState<number>();

  const generateawinvg = React.useCallback(
    (amount: number = 1) => {
      for (let i = 0; i < amount; i++) {
        const seed = { ...getRandomawineed(), ...modSeed };
        const { parts, background } = getNounData(seed);
        const svg = buildSVG(parts, ImageData.palette, background);
        setawinvgs(prev => {
          return prev ? [svg, ...prev] : [svg];
        });
      }
    },
    [modSeed],
  );

  useEffect(() => {
    const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];
    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map(i => {
        return i.map(imageData => imageData.filename);
      }),
    ];
    setTraits(
      traitTitles.map((value, index) => {
        return {
          title: value,
          traitNames: traitNames[index],
        };
      }),
    );

    if (initLoad) {
      generateawinvg(8);
      setInitLoad(false);
    }
  }, [generateawinvg, initLoad]);

  const traitOptions = (trait: Trait) => {
    return Array.from(Array(trait.traitNames.length + 1)).map((_, index) => {
      const parsedTitle = index === 0 ? `Random` : parseTraitName(trait.traitNames[index - 1]);
      return <option key={index}>{parsedTitle}</option>;
    });
  };

  const traitButtonHandler = (trait: Trait, traitIndex: number) => {
    setModSeed(prev => {
      // -1 traitIndex = random
      if (traitIndex < 0) {
        let state = { ...prev };
        delete state[trait.title];
        return state;
      }
      return {
        ...prev,
        [trait.title]: traitIndex,
      };
    });
  };

  return (
    <>
      {displayNoun && indexOfNounToDisplay !== undefined && awinvgs && (
        <NounModal
          onDismiss={() => {
            setDisplayNoun(false);
          }}
          svg={awinvgs[indexOfNounToDisplay]}
        />
      )}

      <Container fluid="lg">
        <Row>
          <Col lg={10} className={classes.headerRow}>
            <span>Explore</span>
            <h1>Playground</h1>
            <p>
              The playground was built using the {awinProtocolLink}. Noun's traits are determined
              by the Noun Seed. The seed was generated using {awinAssetsLink} and rendered using
              the {awinSDKLink}.
            </p>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Button
              onClick={() => {
                generateawinvg();
              }}
              className={classes.generateBtn}
            >
              Generate awin
            </Button>
            {traits &&
              traits.map((trait, index) => {
                return (
                  <Form className={classes.traitForm}>
                    <FloatingLabel
                      controlId="floatingSelect"
                      label={capitalizeFirstLetter(trait.title)}
                      key={index}
                      className={classes.floatingLabel}
                    >
                      <Form.Select
                        aria-label="Floating label select example"
                        className={classes.traitFormBtn}
                        onChange={e => {
                          let index = e.currentTarget.selectedIndex;
                          traitButtonHandler(trait, index - 1); // - 1 to account for 'random'
                        }}
                      >
                        {traitOptions(trait)}
                      </Form.Select>
                    </FloatingLabel>
                  </Form>
                );
              })}
            <p className={classes.nounYearsFooter}>
              You've generated {awinvgs ? (awinvgs.length / 365).toFixed(2) : '0'} years worth of
              awin
            </p>
          </Col>
          <Col lg={9}>
            <Row>
              {awinvgs &&
                awinvgs.map((svg, i) => {
                  return (
                    <Col xs={4} lg={3} key={i}>
                      <div
                        onClick={() => {
                          setIndexOfNounToDisplay(i);
                          setDisplayNoun(true);
                        }}
                      >
                        <Noun
                          imgPath={`data:image/svg+xml;base64,${btoa(svg)}`}
                          alt="noun"
                          className={classes.nounImg}
                          wrapperClassName={classes.nounWrapper}
                        />
                      </div>
                    </Col>
                  );
                })}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Playground;
