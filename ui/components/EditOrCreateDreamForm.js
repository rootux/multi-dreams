import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import Router from "next/router";

import * as yup from "yup";

import { TextField, Box, Button } from "@material-ui/core";

import ImageUpload from "./ImageUpload";
import EditBudgetItems from "./EditBudgetItems";

import slugify from "../utils/slugify";

const CREATE_DREAM = gql`
  mutation CreateDream(
    $eventId: ID!
    $title: String!
    $slug: String!
    $description: String
    $summary: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
    $budgetItems: [BudgetItemInput]
  ) {
    createDream(
      eventId: $eventId
      title: $title
      slug: $slug
      description: $description
      summary: $summary
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
      budgetItems: $budgetItems
    ) {
      id
      slug
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      cocreators {
        id
        user {
          id
          name
        }
      }
      images {
        small
        large
      }
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      budgetItems {
        description
        min
        max
      }
    }
  }
`;

const EDIT_DREAM = gql`
  mutation EDIT_DREAM(
    $dreamId: ID!
    $title: String!
    $slug: String!
    $description: String
    $summary: String
    $images: [ImageInput]
    $minGoal: Int
    $maxGoal: Int
    $budgetItems: [BudgetItemInput]
  ) {
    editDream(
      dreamId: $dreamId
      title: $title
      slug: $slug
      description: $description
      summary: $summary
      images: $images
      minGoal: $minGoal
      maxGoal: $maxGoal
      budgetItems: $budgetItems
    ) {
      id
      slug
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      cocreators {
        id
        user {
          id
          name
        }
      }
      images {
        small
        large
      }
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      budgetItems {
        description
        min
        max
      }
    }
  }
`;

const schema = yup.object().shape({
  title: yup.string().required(),
  slug: yup.string().required(),
  summary: yup.string().required(),
  description: yup.string(),
  images: yup.array().of(
    yup.object().shape({
      small: yup.string().url().required(),
      large: yup.string().url().required(),
    })
  ),
  budgetItems: yup.array().of(
    yup.object().shape({
      description: yup.string().required(),
      min: yup.number().positive().integer().required(),
      max: yup.number().positive().integer(),
    })
  ),
});

export default ({ dream = {}, event, editing }) => {
  const [editDream] = useMutation(EDIT_DREAM);
  const [createDream] = useMutation(CREATE_DREAM);

  const { handleSubmit, register, errors } = useForm({
    validationSchema: schema,
  });

  const { title = "", slug = "", description = "", summary = "" } = dream;

  const [slugValue, setSlugValue] = useState(slug);
  const [images, setImages] = useState(dream.images ? dream.images : []);

  const [budgetItems, setBudgetItems] = useState(
    dream.budgetItems ? dream.budgetItems : []
  );
  const addBudgetItem = () =>
    setBudgetItems([...budgetItems, { description: "", min: 0, max: 0 }]);
  const removeBudgetItem = (i) =>
    setBudgetItems([...budgetItems.filter((item, index) => i !== index)]);

  const onSubmitCreate = (values) => {
    createDream({
      variables: {
        eventId: event.id,
        ...values,
        images,
      },
    })
      .then(({ data }) => {
        Router.push(
          "/[event]/[dream]",
          `/${event.slug}/${data.createDream.slug}`
        );
      })
      .catch((err) => {
        console.log({ err });
        alert(err.message);
      });
  };

  const onSubmitEdit = (values) => {
    images.forEach((image) => delete image.__typename); // apollo complains otherwise..
    editDream({
      variables: {
        dreamId: dream.id,
        ...values,
        images,
      },
    })
      .then(({ data }) => {
        Router.push(
          "/[event]/[dream]",
          `/${event.slug}/${data.editDream.slug}`
        );
      })
      .catch((err) => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <form onSubmit={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}>
      <Box my={2}>
        <TextField
          name="title"
          label="Title"
          defaultValue={title}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          InputProps={{
            onChange: (e) => {
              if (!editing) setSlugValue(slugify(e.target.value));
            },
          }}
          variant="outlined"
          error={Boolean(errors.title)}
          helperText={errors.title && errors.title.message}
        />
      </Box>
      <Box my={2}>
        <TextField
          name="slug"
          label="Slug"
          value={slugValue}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          InputProps={{
            onChange: (e) => setSlugValue(e.target.value),
            onBlur: (e) => setSlugValue(slugify(e.target.value)),
          }}
          variant="outlined"
          error={Boolean(errors.slug)}
          helperText={errors.slug && errors.slug.message}
        />
      </Box>

      <Box my={2}>
        <TextField
          name="summary"
          label="Summary"
          defaultValue={summary}
          fullWidth
          inputRef={register({
            required: "Required",
          })}
          inputProps={{ maxLength: 160 }}
          multiline
          variant="outlined"
          error={Boolean(errors.summary)}
          helperText={errors.summary && errors.summary.message}
        />
      </Box>

      <ImageUpload images={images} setImages={setImages} />

      <Box my={2}>
        <TextField
          name="description"
          label="Description (markdown allowed)"
          defaultValue={description}
          fullWidth
          inputRef={register}
          multiline
          rows={15}
          variant="outlined"
        />
      </Box>

      <EditBudgetItems
        event={event}
        register={register}
        errors={errors}
        budgetItems={budgetItems}
        addBudgetItem={addBudgetItem}
        removeBudgetItem={removeBudgetItem}
      />

      <Button variant="contained" color="primary" size="large" type="submit">
        Save
      </Button>
    </form>
  );
};
