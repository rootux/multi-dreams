import stringToHslColor from "../utils/stringToHslColor";
import ProgressBar from "./ProgressBar";
import Link from "next/link";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import {
  CoinIcon,
  CommentIcon,
  HeartOutlineIcon,
  HeartSolidIcon,
} from "./Icons";
import Label from "./Label";

const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavoriteMutation($dreamId: ID!) {
    toggleFavorite(dreamId: $dreamId) {
      id
      favorite
    }
  }
`;

export default ({ dream, event, currentUser }) => {
  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE_MUTATION, {
    variables: { dreamId: dream.id },
  });

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow duration-75 ease-in-out">
      {dream.images.length ? (
        <img
          src={dream.images[0].small}
          className="w-full h-48 object-cover object-center"
        />
      ) : (
        <div
          className="w-full h-48"
          style={{ background: stringToHslColor(dream.title) }}
        />
      )}
      {!dream.published && (
        <Label className="absolute right-0 m-2">Unpublished</Label>
      )}
      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-xl font-medium mb-1 truncate">{dream.title}</h3>

          <p className="text-gray-800">{dream.summary}</p>
        </div>
        <div>
          {(dream.minGoalGrants || dream.maxGoalGrants) && (
            <ProgressBar
              currentNumberOfGrants={dream.currentNumberOfGrants}
              minGoalGrants={dream.minGoalGrants}
              maxGoalGrants={dream.maxGoalGrants}
            />
          )}

          <div className="flex mt-1">
            {(dream.minGoalGrants || dream.maxGoalGrants) && (
              <div className="mr-3 flex items-center text-gray-700 hover:text-green-700">
                <CoinIcon className="w-5 h-5" />
                <span className="block ml-1">
                  {dream.currentNumberOfGrants}/
                  {dream.maxGoalGrants || dream.minGoalGrants}
                </span>
              </div>
            )}

            <Link
              href="/[event]/[dream]#comments"
              as={`/${event.slug}/${dream.slug}#comments`}
            >
              <div className="mr-3 flex items-center text-gray-700 hover:text-blue-700">
                <CommentIcon className="w-5 h-5" />
                <span className="block ml-1">{dream.numberOfComments} </span>
              </div>
            </Link>
            {currentUser && currentUser.membership && (
              <button
                className="flex items-center focus:outline-none"
                tabIndex="-1"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  if (!loading) toggleFavorite();
                }}
              >
                {dream.favorite ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-700" />
                ) : (
                  <HeartOutlineIcon className="w-5 h-5 text-gray-700 hover:text-red-700" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
